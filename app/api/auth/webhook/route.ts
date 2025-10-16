import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt)
        break
      case 'user.updated':
        await handleUserUpdated(evt)
        break
      case 'user.deleted':
        await handleUserDeleted(evt)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }

  return NextResponse.json({ success: true })
}

async function handleUserCreated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data

  const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id)
  const primaryPhone = phone_numbers.find((phone: any) => phone.id === evt.data.primary_phone_number_id)

  if (!primaryEmail) {
    throw new Error('No primary email found for user')
  }

  // Create user in our database
  const user = await prisma.user.create({
    data: {
      clerkId: id,
      email: primaryEmail.email_address,
      firstName: first_name || null,
      lastName: last_name || null,
      phone: primaryPhone?.phone_number || null,
    },
  })

  console.log('User created:', user)
}

async function handleUserUpdated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data

  const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id)
  const primaryPhone = phone_numbers.find((phone: any) => phone.id === evt.data.primary_phone_number_id)

  if (!primaryEmail) {
    throw new Error('No primary email found for user')
  }

  // Update user in our database
  const user = await prisma.user.update({
    where: { clerkId: id },
    data: {
      email: primaryEmail.email_address,
      firstName: first_name || null,
      lastName: last_name || null,
      phone: primaryPhone?.phone_number || null,
    },
  })

  console.log('User updated:', user)
}

async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data

  // Delete user from our database
  await prisma.user.delete({
    where: { clerkId: id },
  })

  console.log('User deleted:', id)
}