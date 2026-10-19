'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { errorMessage } from '@/lib/http';
import { filesService } from '@/services';
import { useSpace } from '@/hooks/useSpace';
import { useUploads } from '@/hooks/useUploads';
import { ErrorBox } from '@/components/ui';
import type { ModalState } from './types';
import ChannelGrid from './ChannelGrid';
import CategoryBar from './CategoryBar';
import UploadZone from './UploadZone';
import FilterBar from './FilterBar';
import FileList from './FileList';
import SpaceModals from './SpaceModals';

/**
 * Espacio de archivos de un usuario (canales → categorías → archivos).
 * Este componente solo ARMA la pantalla; la lógica está en los hooks
 * `useSpace` y `useUploads`, y cada bloque visual es su propio componente.
 */
export default function SpaceView({
  userId,
  readOnly,
  title,
}: {
  userId: number;
  readOnly: boolean;
  title: string;
}) {
  const space = useSpace(userId);
  const { uploads, upload, clearFinished } = useUploads(space.refresh);
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState('');

  const { selectedChannel, selectedCategory } = space;
  const canUpload = !readOnly && !!selectedChannel && !!selectedCategory;

  const uploadHint = !selectedChannel
    ? 'Primero elige un canal.'
    : 'Ahora elige (o crea) una categoría dentro del canal.';

  async function download(id: number) {
    try {
      setActionError('');
      await filesService.download(id);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }

  return (
    <div className="page-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {readOnly && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <Eye className="h-4 w-4" />
            Modo consulta: puedes ver y descargar, pero no modificar.
          </p>
        )}
      </div>

      {(space.error || actionError) && <ErrorBox message={space.error || actionError} />}

      <ChannelGrid
        channels={space.channels}
        loading={space.chLoading}
        readOnly={readOnly}
        selectedId={space.q.channelId}
        totalFiles={space.totalFiles}
        onSelect={(id) => space.patch({ channelId: id, categoryId: null })}
        onNew={() => setModal({ kind: 'newChannel' })}
        onRename={(channel) => setModal({ kind: 'renameChannel', channel })}
        onDelete={(channel) => setModal({ kind: 'deleteChannel', channel })}
      />

      {selectedChannel && (
        <CategoryBar
          channel={selectedChannel}
          selected={selectedCategory}
          readOnly={readOnly}
          onSelect={(id) => space.patch({ categoryId: id })}
          onNew={() => setModal({ kind: 'newCategory', channel: selectedChannel })}
          onRename={(category) => setModal({ kind: 'renameCategory', category })}
          onDelete={(category) => setModal({ kind: 'deleteCategory', category })}
        />
      )}

      {!readOnly && (
        <UploadZone
          target={canUpload ? `${selectedChannel!.name} › ${selectedCategory!.name}` : null}
          hint={uploadHint}
          uploads={uploads}
          onFiles={(files) => canUpload && upload(files, selectedChannel!.id, selectedCategory!.id)}
          onClear={clearFinished}
        />
      )}

      <FilterBar
        searchInput={space.searchInput}
        onSearchInput={space.setSearchInput}
        type={space.q.type}
        onType={(type) => space.patch({ type })}
        sort={space.q.sort}
        onSort={(sort) => space.patch({ sort })}
      />

      <FileList
        data={space.data}
        loading={space.loading}
        readOnly={readOnly}
        page={space.q.page}
        onPageChange={space.setPage}
        onPreview={(file) => setModal({ kind: 'preview', file })}
        onDownload={(file) => download(file.id)}
        onEdit={(file) => setModal({ kind: 'editFile', file })}
        onDelete={(file) => setModal({ kind: 'deleteFile', file })}
      />

      <SpaceModals
        modal={modal}
        channels={space.channels}
        space={space}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
