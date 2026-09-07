"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

interface ToastProps {
  type?: "success" | "error";
  message?: string;
}

export default function Toast({ type, message }: ToastProps) {
  useEffect(() => {
    if (type && message) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
        background: "#333",
        color: "#fff",
      });
      Toast.fire({
        icon: type,
        title: message,
      });
    }
  }, [type, message]);

  return null;
}
