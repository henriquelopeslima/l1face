import { useCallback, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { AtaCriada, CriarAtaInput } from '../../domain/entities/criarAta';
import { AtaError } from '../../domain/errors/ataErrors';
import { CriarAtaUseCase } from '../../domain/usecases/CriarAtaUseCase';
import { UploadAnexoAtaUseCase } from '../../domain/usecases/UploadAnexoAtaUseCase';

const repository = new AtasRepository();
const criarAtaUseCase = new CriarAtaUseCase(repository);
const uploadAnexoAtaUseCase = new UploadAnexoAtaUseCase(repository);

interface UseCriarAtaResult {
  criarAta: (input: CriarAtaInput, arquivo?: File | null) => Promise<AtaCriada | null>;
  isLoading: boolean;
  error: string | null;
  anexoFalhouUpload: boolean;
}

export function useCriarAta(): UseCriarAtaResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anexoFalhouUpload, setAnexoFalhouUpload] = useState(false);

  const criarAta = useCallback(async (input: CriarAtaInput, arquivo?: File | null): Promise<AtaCriada | null> => {
    setIsLoading(true);
    setError(null);
    setAnexoFalhouUpload(false);
    try {
      const criada = await criarAtaUseCase.execute(input);
      if (arquivo) {
        try {
          await uploadAnexoAtaUseCase.execute(criada.id, arquivo);
        } catch {
          setAnexoFalhouUpload(true);
        }
      }
      return criada;
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao cadastrar ata. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criarAta, isLoading, error, anexoFalhouUpload };
}
