export type FileAccessActor = { id: string; roles: string[] };

export type FileAccessContext = {
  ownerId: string;
  uploadedById: string;
  linkedUserIds: Iterable<string>;
  isArchiveFile: boolean;
};

export function canAccessFile(actor: FileAccessActor, context: FileAccessContext): boolean {
  if (actor.id === context.ownerId || actor.id === context.uploadedById) return true;
  if (actor.roles.some((role) => role === 'ADMIN' || role === 'FACULTY_MANAGER')) return true;
  if (context.isArchiveFile && actor.roles.includes('ARCHIVE_STAFF')) return true;
  for (const userId of context.linkedUserIds) {
    if (userId === actor.id) return true;
  }
  return false;
}
