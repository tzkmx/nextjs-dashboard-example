import Form from '@/app/ui/invoices/create-form'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import { fetchCustomers } from '@/app/lib/data'
import {
  CREATE_INVOICE_URL,
  DASHBOARD_INVOICES_URL,
} from '@/app/lib/navigation'

export default async function Page() {
  const customers = await fetchCustomers()

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: DASHBOARD_INVOICES_URL },
          {
            label: 'Create Invoice',
            href: CREATE_INVOICE_URL,
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  )
}
