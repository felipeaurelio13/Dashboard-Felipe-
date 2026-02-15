'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMessage(error ? error.message : 'Revisa tu email para el magic link');
  };

  return (
    <section className="card">
      <h1 className="text-xl font-semibold mb-3">Ingreso seguro</h1>
      <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
      <button className="btn-primary mt-3 w-full" onClick={signIn}>Enviar magic link</button>
      {message && <p role="alert" className="mt-2 text-sm">{message}</p>}
    </section>
  );
}
