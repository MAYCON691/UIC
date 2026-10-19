'use client';

import type { Channel } from '@/lib/types';
import type { UpdateFileInput } from '@/services';
import { ConfirmModal } from '@/components/ui';
import type { ModalState } from './types';
import NameModal from './NameModal';
import EditFileModal from './EditFileModal';
import PreviewModal from './PreviewModal';
import type { useSpace } from '@/hooks/useSpace';

type Space = ReturnType<typeof useSpace>;

/** Elige y pinta la ventana abierta según `modal`. Cada acción cierra la ventana al terminar. */
export default function SpaceModals({
  modal,
  channels,
  space,
  onClose,
}: {
  modal: ModalState;
  channels: Channel[];
  space: Space;
  onClose: () => void;
}) {
  if (!modal) return null;

  /** Ejecuta la acción y, si sale bien, cierra la ventana. */
  const then = (action: Promise<unknown>) => action.then(onClose);

  switch (modal.kind) {
    case 'newChannel':
      return (
        <NameModal
          title="Añadir canal"
          label="Nombre del canal"
          placeholder="Ej: ATB, Red Uno, Bolivisión…"
          submitLabel="Crear canal"
          onClose={onClose}
          onSubmit={(name) => then(space.createChannel(name))}
        />
      );
    case 'renameChannel':
      return (
        <NameModal
          title="Renombrar canal"
          label="Nombre del canal"
          initial={modal.channel.name}
          submitLabel="Guardar"
          onClose={onClose}
          onSubmit={(name) => then(space.renameChannel(modal.channel.id, name))}
        />
      );
    case 'deleteChannel':
      return (
        <ConfirmModal
          title="Eliminar canal"
          message={`Se eliminará el canal “${modal.channel.name}” con sus categorías y los ${modal.channel._count.files} archivos que contiene. Esta acción no se puede deshacer.`}
          onClose={onClose}
          onConfirm={() => then(space.deleteChannel(modal.channel))}
        />
      );
    case 'newCategory':
      return (
        <NameModal
          title={`Nueva categoría en ${modal.channel.name}`}
          label="Nombre de la categoría"
          placeholder="Ej: Videos, Audios, PDF…"
          submitLabel="Crear categoría"
          onClose={onClose}
          onSubmit={(name) => then(space.createCategory(modal.channel, name))}
        />
      );
    case 'renameCategory':
      return (
        <NameModal
          title="Renombrar categoría"
          label="Nombre de la categoría"
          initial={modal.category.name}
          submitLabel="Guardar"
          onClose={onClose}
          onSubmit={(name) => then(space.renameCategory(modal.category.id, name))}
        />
      );
    case 'deleteCategory':
      return (
        <ConfirmModal
          title="Eliminar categoría"
          message={`Se eliminará la categoría “${modal.category.name}” y los ${modal.category._count.files} archivos que contiene. Esta acción no se puede deshacer.`}
          onClose={onClose}
          onConfirm={() => then(space.deleteCategory(modal.category))}
        />
      );
    case 'editFile':
      return (
        <EditFileModal
          file={modal.file}
          channels={channels}
          onClose={onClose}
          onSave={(values: UpdateFileInput) => then(space.saveFile(modal.file, values))}
        />
      );
    case 'deleteFile':
      return (
        <ConfirmModal
          title="Eliminar archivo"
          message={`¿Eliminar “${modal.file.originalName}”? Esta acción no se puede deshacer.`}
          onClose={onClose}
          onConfirm={() => then(space.deleteFile(modal.file))}
        />
      );
    case 'preview':
      return <PreviewModal file={modal.file} onClose={onClose} />;
  }
}
