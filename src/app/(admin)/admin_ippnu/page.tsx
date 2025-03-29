import { authOptions } from "@/nextauth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return <div className="p-6">Halo, {session.user?.email}! Ini halaman admin IPPNU.</div>;
}

export default AdminPage;