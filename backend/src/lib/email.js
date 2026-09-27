import sgMail from '@sendgrid/mail';

// Sem a chave configurada, o app continua funcionando normalmente — só não
// manda e-mail de verdade (mesmo comportamento que o sistema antigo tinha).
const configurado = !!process.env.SENDGRID_API_KEY;
if (configurado) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Envia um e-mail via SendGrid. O remetente (SENDGRID_FROM) precisa ser um
 * endereço verificado na conta SendGrid (Single Sender Verification) —
 * ver PROGRESSO.md seção 17.5 pra como configurar.
 *
 * @returns {{ enviado: boolean, motivo?: string }}
 */
export async function enviarEmail({ to, subject, html }) {
  if (!configurado) {
    return { enviado: false, motivo: 'SENDGRID_API_KEY não configurada' };
  }
  await sgMail.send({ to, from: process.env.SENDGRID_FROM, subject, html });
  return { enviado: true };
}
