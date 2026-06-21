import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { PerfilRepository } from '../../data/repositories/PerfilRepository';
import { FormatoInvalidoError, ArquivoMuitoGrandeError } from '../../domain/errors/perfilErrors';
import { RemoverFotoPerfilUseCase } from '../../domain/useCases/RemoverFotoPerfilUseCase';
import { UploadFotoPerfilUseCase } from '../../domain/useCases/UploadFotoPerfilUseCase';

const repository = new PerfilRepository();
const uploadUseCase = new UploadFotoPerfilUseCase(repository);
const removerUseCase = new RemoverFotoPerfilUseCase(repository);

const TIPOS_ACEITOS = ['image/jpeg', 'image/png'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export function useUploadFotoPerfil() {
  const { updateFotoPerfil } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleUpload = useCallback(async (arquivo: File) => {
    setError(null);

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setError('Formato não suportado. Envie um arquivo JPEG ou PNG.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setError('O arquivo excede o limite de 5 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadUseCase.execute(arquivo);
      updateFotoPerfil(result.fotoUrl);
    } catch (err) {
      if (err instanceof FormatoInvalidoError || err instanceof ArquivoMuitoGrandeError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar foto. Tente novamente.');
      }
    } finally {
      setIsUploading(false);
    }
  }, [updateFotoPerfil]);

  const handleRemover = useCallback(async () => {
    setError(null);
    setIsRemoving(true);
    try {
      await removerUseCase.execute();
      updateFotoPerfil(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover foto. Tente novamente.');
    } finally {
      setIsRemoving(false);
    }
  }, [updateFotoPerfil]);

  return { isUploading, isRemoving, error, clearError, handleUpload, handleRemover };
}
