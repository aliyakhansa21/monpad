import { useAuth } from "@/context/AuthContext";

export function useUserRole() {
    const { role } = useAuth();
    return role || null; // "asisten", "dosen", "mahasiswa"
}
