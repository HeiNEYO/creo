/** Remplace les variables {{first_name}}, {{last_name}}, {{email}} dans un texte HTML ou sujet. */
export function personalizeEmailText(
  template: string,
  contact: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  }
): string {
  return template
    .replace(/\{\{\s*first_name\s*\}\}/gi, contact.first_name?.trim() || "")
    .replace(/\{\{\s*last_name\s*\}\}/gi, contact.last_name?.trim() || "")
    .replace(/\{\{\s*email\s*\}\}/gi, contact.email);
}
