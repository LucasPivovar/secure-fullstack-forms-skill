<script setup lang="ts">
import { reactive, ref } from 'vue';
import { z } from 'zod';

// 1. Strict Client Schema (Trims whitespace, enforces length bounds, blocks HTML tags)
const ContactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.')
    .regex(/^[^<>]*$/, 'HTML tags are not allowed.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(255),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.')
    .regex(/^[^<>]*$/, 'HTML tags are not allowed.'),
});

type ContactFormPayload = z.infer<typeof ContactFormSchema>;

const form = reactive<ContactFormPayload>({
  name: '',
  email: '',
  message: '',
});

// 2. Complete UI State Machine
const isSubmitting = ref(false);
const isSuccess = ref(false);
const serverError = ref<string | null>(null);
const fieldErrors = ref<Partial<Record<keyof ContactFormPayload, string>>>({});

async function handleSubmit() {
  // Prevent double submission race conditions
  if (isSubmitting.value) return;

  fieldErrors.value = {};
  serverError.value = null;
  isSuccess.value = false;

  // Step A: Client-side Zod validation before touching the network
  const parsed = ContactFormSchema.safeParse(form);
  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    fieldErrors.value = {
      name: flattened.name?.[0],
      email: flattened.email?.[0],
      message: flattened.message?.[0],
    };
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch('/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(parsed.data), // Send only sanitized & validated schema output
    });

    if (response.status === 422 || response.status === 400) {
      const errBody = await response.json();
      if (errBody?.errors) {
        fieldErrors.value = {
          name: errBody.errors.name?.[0],
          email: errBody.errors.email?.[0],
          message: errBody.errors.message?.[0],
        };
      } else {
        serverError.value = errBody?.message || 'Invalid form submission.';
      }
      return;
    }

    if (response.status === 429) {
      serverError.value = 'Too many attempts. Please wait a moment and try again.';
      return;
    }

    if (!response.ok) {
      throw new Error('Unexpected server error');
    }

    isSuccess.value = true;
    form.name = '';
    form.email = '';
    form.message = '';
  } catch {
    serverError.value = 'Unable to submit the form right now. Please try again later.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div v-if="serverError" role="alert" class="error-banner">
      {{ serverError }}
    </div>

    <div v-if="isSuccess" role="status" class="success-banner">
      Message sent successfully!
    </div>

    <div class="field">
      <label for="name">Full Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        autocomplete="name"
        maxlength="100"
        :disabled="isSubmitting"
        :aria-invalid="Boolean(fieldErrors.name)"
      />
      <p v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</p>
    </div>

    <div class="field">
      <label for="email">Email Address</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        maxlength="255"
        :disabled="isSubmitting"
        :aria-invalid="Boolean(fieldErrors.email)"
      />
      <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
    </div>

    <div class="field">
      <label for="message">Message</label>
      <textarea
        id="message"
        v-model="form.message"
        rows="4"
        maxlength="2000"
        :disabled="isSubmitting"
        :aria-invalid="Boolean(fieldErrors.message)"
      />
      <p v-if="fieldErrors.message" class="field-error">{{ fieldErrors.message }}</p>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Sending...' : 'Send Message' }}
    </button>
  </form>
</template>
