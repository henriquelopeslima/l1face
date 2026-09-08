import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { CriarContratoInput } from '../../domain/entities/criarContrato';
import { CriarContratoUseCase } from '../../domain/useCases/CriarContratoUseCase';
// TEMP(anexo): import { UploadAnexoContratoUseCase } from '../../domain/useCases/UploadAnexoContratoUseCase';

const repository = new InstrumentosRepository();
const criarContratoUseCase = new CriarContratoUseCase(repository);
// TEMP(anexo): const uploadAnexoContratoUseCase = new UploadAnexoContratoUseCase(repository);

interface UseCriarContratoResult {
  criar: (input: CriarContratoInput, arquivo?: File | null) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  anexoFalhouUpload: boolean;
}

export function useCriarContrato(): UseCriarContratoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anexoFalhouUpload, setAnexoFalhouUpload] = useState(false);

  const criar = useCallback(async (input: CriarContratoInput, arquivo?: File | null): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setAnexoFalhouUpload(false);
    try {
      const instrumentoId = await criarContratoUseCase.execute(input);
      // TEMP(anexo): upload desativado enquanto anexo_object_key não está disponível no backend.
      // if (arquivo) {
      //   try {
      //     await uploadAnexoContratoUseCase.execute(instrumentoId, arquivo);
      //   } catch {
      //     setAnexoFalhouUpload(true);
      //   }
      // }
      void arquivo;
      return instrumentoId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar contrato. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criar, isLoading, error, anexoFalhouUpload };
}
