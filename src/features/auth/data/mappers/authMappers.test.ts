import { describe, it, expect } from 'vitest';
import { mapApiMeToUser } from './authMappers';

const baseLicitante = { id: 'l1', cnpj: '11222333000181', nome_empresa: 'Empresa LTDA' };

describe('mapApiMeToUser', () => {
  it('mapeia foto_perfil_url para fotoPerfil quando presente', () => {
    const raw = {
      id: 'u1',
      email: 'a@b.com',
      nome_completo: 'João Silva',
      foto_perfil_url: 'https://cdn.example.com/foto.jpg',
      licitantes: [baseLicitante],
    };
    const user = mapApiMeToUser(raw);
    expect(user.fotoPerfil).toBe('https://cdn.example.com/foto.jpg');
  });

  it('mapeia fotoPerfil como null quando foto_perfil_url é null', () => {
    const raw = {
      id: 'u1',
      email: 'a@b.com',
      nome_completo: 'João Silva',
      foto_perfil_url: null,
      licitantes: [baseLicitante],
    };
    const user = mapApiMeToUser(raw);
    expect(user.fotoPerfil).toBeNull();
  });

  it('mapeia fotoPerfil como null quando foto_perfil_url está ausente', () => {
    const raw = {
      id: 'u1',
      email: 'a@b.com',
      nome_completo: 'João Silva',
      licitantes: [baseLicitante],
    };
    const user = mapApiMeToUser(raw);
    expect(user.fotoPerfil).toBeNull();
  });

  it('retorna User completo com todos os campos obrigatórios', () => {
    const raw = {
      id: 'u1',
      email: 'a@b.com',
      nome_completo: 'João Silva',
      foto_perfil_url: 'https://cdn.example.com/foto.jpg',
      licitantes: [baseLicitante],
    };
    const user = mapApiMeToUser(raw);
    expect(user).toEqual({
      id: 'u1',
      email: 'a@b.com',
      nomeCompleto: 'João Silva',
      fotoPerfil: 'https://cdn.example.com/foto.jpg',
      licitantes: [{ id: 'l1', cnpj: '11222333000181', nomeEmpresa: 'Empresa LTDA' }],
    });
  });
});
