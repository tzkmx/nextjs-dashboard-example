'use server'
import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DASHBOARD_INVOICES_URL } from '@/app/lib/navigation'

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce.number().gt(0, { message: 'Amount must be greater than 0' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a status',
  }),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export type State = {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

export async function createInvoice(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  if (!validFields.success) {
    return {
      errors: validFields.error.flatten().fieldErrors,
      message: 'Error creating invoice',
    }
  }
  const { customerId, amount, status } = validFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `
  } catch (e) {
    console.error(e)
  }
  redirectToDashboardInvoices()
  return {
    message: 'Error creating invoice',
  }
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  if (!validFields.success) {
    return {
      errors: validFields.error.flatten().fieldErrors,
      message: 'Error updating invoice',
    }
  }
  const { customerId, amount, status } = validFields.data
  const amountInCents = amount * 100
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId},
          amount      = ${amountInCents},
          status      = ${status}
      WHERE id = ${id}
    `
  } catch (e) {
    console.error(e)
    return { message: 'Error updating invoice' }
  }
  redirectToDashboardInvoices()
  return { message: 'Updated invoice' }
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE
              FROM invoices
              WHERE id = ${id}`
  } catch (e) {
    console.error(e)
    return {
      message: 'Error deleting invoice',
    }
  }
  revalidateDashboardInvoices()
  return {
    message: 'Invoice deleted',
  }
}

function redirectToDashboardInvoices() {
  revalidatePath(DASHBOARD_INVOICES_URL)
  redirect(DASHBOARD_INVOICES_URL)
}

function revalidateDashboardInvoices() {
  revalidatePath(DASHBOARD_INVOICES_URL)
}
