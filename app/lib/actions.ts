'use server'
import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DASHBOARD_INVOICES_URL } from '@/app/lib/navigation'

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `

  redirectToDashboardInvoices()
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  const amountInCents = amount * 100
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId},
        amount      = ${amountInCents},
        status      = ${status}
    WHERE id = ${id}
  `
  redirectToDashboardInvoices()
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE
    FROM invoices
    WHERE id = ${id}
  `
  revalidateDashboardInvoices()
}

function redirectToDashboardInvoices() {
  revalidatePath(DASHBOARD_INVOICES_URL)
  redirect(DASHBOARD_INVOICES_URL)
}

function revalidateDashboardInvoices() {
  revalidatePath(DASHBOARD_INVOICES_URL)
}
