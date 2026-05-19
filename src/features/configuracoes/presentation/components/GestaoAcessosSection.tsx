import { useCallback, useId, useState } from 'react';
import { EditPencil, Group, PlusCircle, Trash } from 'iconoir-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { cn } from '@/shared/components/ui/utils';

type TipoUsuario = 'admin' | 'colaborador';

interface UsuarioAcesso {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}

function gerarSenhaAleatoria(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MOCK_INICIAL: UsuarioAcesso[] = [
  { id: '1', nome: 'Maria Silva', email: 'maria.silva@lpsolucoes.com.br', tipo: 'colaborador' },
  { id: '2', nome: 'João Ferreira', email: 'joao.ferreira@lpsolucoes.com.br', tipo: 'admin' },
];

export function GestaoAcessosSection() {
  const formId = useId();
  const [usuarios, setUsuarios] = useState<UsuarioAcesso[]>(MOCK_INICIAL);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modo, setModo] = useState<'criar' | 'editar'>('criar');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<TipoUsuario>('colaborador');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [removerId, setRemoverId] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setNome('');
    setEmail('');
    setTipo('colaborador');
    setSenha('');
    setFeedback(null);
    setEditandoId(null);
  }, []);

  const abrirCriar = () => {
    resetForm();
    setModo('criar');
    setDrawerOpen(true);
  };

  const abrirEditar = (u: UsuarioAcesso) => {
    setModo('editar');
    setEditandoId(u.id);
    setNome(u.nome);
    setEmail(u.email);
    setTipo(u.tipo);
    setSenha('');
    setFeedback(null);
    setDrawerOpen(true);
  };

  const gerarSenhaSomente = () => {
    setSenha(gerarSenhaAleatoria());
    setFeedback('Senha gerada. Copie ou salve para enviar ao usuário por outro canal, se necessário.');
  };

  const gerarSenhaEEnviarEmail = () => {
    setSenha(gerarSenhaAleatoria());
    setFeedback(`Senha gerada e enviada (simulação) para ${email || 'o e-mail informado'}.`);
  };

  const salvar = () => {
    const n = nome.trim();
    const e = email.trim().toLowerCase();
    if (!n || !e) return;
    if (modo === 'criar') {
      setUsuarios((prev) => [...prev, { id: crypto.randomUUID(), nome: n, email: e, tipo }]);
    } else if (editandoId) {
      setUsuarios((prev) => prev.map((u) => (u.id === editandoId ? { ...u, nome: n, email: e, tipo } : u)));
    }
    setDrawerOpen(false);
    resetForm();
  };

  const confirmarRemocao = () => {
    if (!removerId) return;
    setUsuarios((prev) => prev.filter((u) => u.id !== removerId));
    setRemoverId(null);
  };

  const usuarioRemover = usuarios.find((u) => u.id === removerId);

  return (
    <>
      <Card id="gestao-acessos" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Group className="h-4 w-4 lg:h-5 lg:w-5" />
                Gestão de acessos
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Cadastre colaboradores e administradores, edite dados e controle senhas de acesso.
              </CardDescription>
            </div>
            <Button type="button" className="shrink-0 gap-2" onClick={abrirCriar}>
              <PlusCircle className="h-4 w-4" />
              Adicionar usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum acesso cadastrado. Use &quot;Adicionar usuário&quot; para incluir o primeiro.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          u.tipo === 'admin'
                            ? 'border-[#0050FF] text-[#0050FF] bg-[#EDF4FF]/80 dark:bg-[#0050FF]/15'
                            : ''
                        )}
                      >
                        {u.tipo === 'admin' ? 'Administrador' : 'Colaborador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Editar ${u.nome}`}
                          onClick={() => abrirEditar(u)}
                        >
                          <EditPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label={`Remover ${u.nome}`}
                          onClick={() => setRemoverId(u.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) resetForm();
        }}
        direction="right"
        shouldScaleBackground={false}
      >
        <DrawerContent
          className={cn(
            'gap-0 p-0 data-[vaul-drawer-direction=right]:mt-0',
            'flex h-[100dvh] max-h-[100dvh] flex-col',
            'w-[min(100vw,28rem)] sm:max-w-lg'
          )}
        >
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle className="text-lg">
              {modo === 'criar' ? 'Adicionar usuário' : 'Gerenciar acesso'}
            </DrawerTitle>
            <DrawerDescription>
              {modo === 'criar'
                ? 'Preencha nome, e-mail e tipo. Defina a senha manualmente ou use as opções de geração abaixo.'
                : 'Atualize os dados do usuário. Para alterar a senha, use o campo ou as ações de geração.'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <form
              id={formId}
              className="grid gap-4"
              onSubmit={(ev) => {
                ev.preventDefault();
                salvar();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-nome`}>Nome</Label>
                <Input id={`${formId}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-email`}>E-mail</Label>
                <Input id={`${formId}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-tipo`}>Tipo de usuário</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoUsuario)}>
                  <SelectTrigger id={`${formId}-tipo`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <Label htmlFor={`${formId}-senha`}>Senha de acesso</Label>
                <Input
                  id={`${formId}-senha`}
                  type="text"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={modo === 'editar' ? 'Nova senha (opcional)' : 'Digite uma senha ou gere automaticamente'}
                  autoComplete="new-password"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={gerarSenhaSomente}>
                    Gerar automaticamente
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={gerarSenhaEEnviarEmail}>
                    Gerar e enviar por e-mail
                  </Button>
                </div>
                {feedback ? <p className="text-xs text-muted-foreground leading-snug">{feedback}</p> : null}
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t border-border bg-background sm:flex-row sm:justify-end sm:gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button type="submit" form={formId}>Salvar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!removerId} onOpenChange={(open) => !open && setRemoverId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioRemover
                ? `O usuário "${usuarioRemover.nome}" (${usuarioRemover.email}) perderá o acesso à organização. Esta ação pode ser irreversível.`
                : 'Confirme a remoção deste acesso.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmarRemocao}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
