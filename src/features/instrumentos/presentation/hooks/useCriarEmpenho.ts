import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { CriarEmpenhoInput } from '../../domain/entities/criarContrato';
import { CriarEmpenhoUseCase } from '../../domain/useCases/CriarEmpenhoUseCase';
import { UploadAnexoEmpenhoUseCase } from '../../domain/useCases/UploadAnexoEmpenhoUseCase';

const repository = new InstrumentosRepository();
const criarEmpenhoUseCase = new CriarEmpenhoUseCase(repository);
const uploadAnexoEmpenhoUseCase = new UploadAnexoEmpenhoUseCase(repository);

interface UseCriarEmpenhoResult {
  criar: (input: CriarEmpenhoInput, arquivo?: File | null) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  anexoFalhouUpload: boolean;
}

export function useCriarEmpenho(): UseCriarEmpenhoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anexoFalhouUpload, setAnexoFalhouUpload] = useState(false);

  const criar = useCallback(async (input: CriarEmpenhoInput, arquivo?: File | null): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setAnexoFalhouUpload(false);
    try {
      const instrumentoId = await criarEmpenhoUseCase.execute(input);
      if (arquivo) {
        try {
          await uploadAnexoEmpenhoUseCase.execute(instrumentoId, arquivo);
        } catch {
          setAnexoFalhouUpload(true);
        }
      }
      return instrumentoId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar empenho. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criar, isLoading, error, anexoFalhouUpload };
}
