import Link from "next/link";

export default function Page() {
    return <main>
    <p>Dashboard page</p>
        <ul>
            <li>
                <Link href={'/dashboard/customers'}>Customers page</Link>

            </li>
            <li>
                <Link href={'/dashboard/invoices'}>Invoices page</Link>
            </li>
        </ul>
    </main>
}
