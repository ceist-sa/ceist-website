// Email signature for CEIST team members (used by /assinatura).
// Email clients and signature editors drop <style> blocks and web fonts, so everything is inline: Lora falls back
// to Georgia, Gill Sans is built into Apple devices, else Calibri/Trebuchet. The logo is the circular icon (a dark
// disc with the light symbol) so it stays visible when email apps switch to dark mode, and it is loaded from
// static/email/, which is public (static files are served without going through the auth hook).

export type SignatureData = { name: string; role: string; email: string; phone: string };

export const LOGO_URL = 'https://ceist.pt/email/icon-ink.png';

const INK = '#282828';
const SERIF = "Lora,Georgia,'Times New Roman',serif";
const SANS = "'Gill Sans','Gill Sans MT',Calibri,'Trebuchet MS',sans-serif";
// The final plain space lets a narrow window wrap the line after the dot.
const SEP = '&nbsp;&nbsp;·&nbsp; ';

const esc = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const link = (href: string, text: string) =>
	`<a href="${href}" style="color:${INK};text-decoration:none;white-space:nowrap;">${text}</a>`;

// Uppercase is written out rather than left to text-transform, which some clients drop.
export function signatureHTML({ name, role, email, phone }: SignatureData, logo = LOGO_URL): string {
	const contacts = [
		phone && link(`tel:${phone.replace(/[^\d+]/g, '')}`, esc(phone)),
		email && link(`mailto:${esc(email)}`, esc(email))
	]
		.filter(Boolean)
		.join(SEP);
	return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;color:${INK};">
<tr>
<td valign="top" style="padding:3px 18px 0 0;"><a href="https://ceist.pt" style="text-decoration:none;"><img src="${logo}" width="60" height="60" alt="CEIST" style="display:block;width:60px;min-width:60px;max-width:none;height:60px;border:0;"></a></td>
<td valign="top" style="padding:0 0 0 18px;border-left:1px solid #C9C8C4;">
<div style="font-family:${SERIF};font-weight:bold;font-size:17px;line-height:1.3;letter-spacing:0.03em;color:${INK};">${esc(name || 'Nome Apelido')}</div>
${role ? `<div style="font-family:${SANS};font-size:12px;line-height:1.5;letter-spacing:0.07em;color:${INK};">${esc(role.toLocaleUpperCase('pt-PT'))}</div>` : ''}
${contacts ? `<div style="font-family:${SERIF};font-size:13px;line-height:1.5;letter-spacing:0.02em;color:${INK};padding-top:4px;">${contacts}</div>` : ''}
<div style="font-family:${SANS};font-size:11px;line-height:1.45;letter-spacing:0.07em;color:${INK};padding-top:12px;">CAMERATA DE ESTUDANTES<br>DO INSTITUTO SUPERIOR TÉCNICO</div>
<div style="font-family:${SERIF};font-size:13px;line-height:1.5;letter-spacing:0.02em;color:${INK};padding-top:3px;">${[
		link('https://ceist.pt', 'ceist.pt'),
		link('https://www.instagram.com/ce.ist/', 'Instagram'),
		link('https://www.youtube.com/@CE-IST', 'YouTube')
	].join(SEP)}</div>
</td>
</tr>
</table>`;
}

export function signatureText({ name, role, email, phone }: SignatureData): string {
	return [
		name,
		role,
		[phone, email].filter(Boolean).join(' · '),
		'',
		'CEIST · Camerata de Estudantes do Instituto Superior Técnico',
		'ceist.pt'
	]
		.filter((line, i) => line || i === 3)
		.join('\n');
}
