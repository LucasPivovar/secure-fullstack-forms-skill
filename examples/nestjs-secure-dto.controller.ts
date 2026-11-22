import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

// 1. Strict Whitelisted DTO (Blocks Mass Assignment & XSS tags)
export class CreateContactDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[^<>]*$/, { message: 'HTML tags are not allowed in name' })
  name!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  @Matches(/^[^<>]*$/, { message: 'HTML tags are not allowed in message' })
  message!: string;
}

@Controller('api/v1/contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Rate limit: max 5 submissions per 60 seconds per IP
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  // Strict ValidationPipe strips or rejects any injected properties like { "role": "admin" }
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async submitContact(@Body() dto: CreateContactDto) {
    // Parameterized ORM query — 100% immune to SQL Injection
    const submission = await this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        message: dto.message,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      status: 'success',
      data: submission,
    };
  }
}
