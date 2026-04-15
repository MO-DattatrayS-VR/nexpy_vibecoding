import React, {useState} from 'react';
import {useAuth} from "@/api/auth/auth-context";
import toast from "react-hot-toast";
import {useRouter} from "next/router";
import ConfirmModal from "@/components/confirmation-modal";

export default function LogoutButton() {
    const {logout} = useAuth();
    const router = useRouter();
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logout successful!');
        await router.push('/');
    };

    return (
        <ConfirmModal
            open={showCancelConfirmation}
            onClose={() => setShowCancelConfirmation(false)}
            onConfirm={handleLogout}
            buttonName="Logout"
            buttonSize="small"
            // icon={<LogoutIcon/>}
            buttonVariant={"outlined"}
            confirmButtonName="Logout"
            title="You are about to logout"
            confirmationText="Please confirm you want to logout"
            color="error"
        />
    );
}
