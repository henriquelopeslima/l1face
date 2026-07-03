import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Group, PlusCircle, Trash } from 'iconoir-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/components/ui/utils';
import { useGestaoAcessos } from '../hooks/useGestaoAcessos';

const emailSchema = z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.');
const nomeSchema = z.string().trim().min(1, 'Informe o nome.');

export function GestaoAcessosSection() {
  const {
    usuarios,
    isLoading,
    error,
    currentUserId,
    isAdmin,
    removendoId,
    removeError,
    revogarAcesso,
    clearRemoveError,
    convidando,
    convidarError,
    convidarSucesso,
    convidarColaborador,
    clearConvidarFeedback,
  } = useGestaoAcessos();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [confirmandoUserId, setConfirmandoUserId] = useState<string | null>(null);

  const abrirConvite = () => {
    setEmail('');
    setEmailError(null);
    setNome('');
    setNomeError(null);
    clearConvidarFeedback();
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      clearConvidarFeedback();
    }
  };

  const handleSubmitConvite = async (ev: FormEvent) => {
    ev.preventDefault();
    const emailResult = emailSchema.safeParse(email);
    const nomeResult = nomeSchema.safeParse(nome);

    setEmailError(emailResult.success ? null : emailResult.error.issues[0]?.message ?? 'Informe um e-mail válido.');
    setNomeError(nomeResult.success ? null : nomeResult.error.issues[0]?.message ?? 'Informe o nome.');

    if (!emailResult.success || !nomeResult.success) {
      return;
    }

    const sucesso = await convidarColaborador(emailResult.data, nomeResult.data);
    if (sucesso) {
      setEmail('');
      setNome('');
    }
  };

  const usuarioParaRemover = usuarios.find((u) => u.userId === confirmandoUserId);

  const handleConfirmarRemocao = async () => {
    if (!confirmandoUserId) return;
    const userId = confirmandoUserId;
    setConfirmandoUserId(null);
    await revogarAcesso(userId);
  };

  const handleFecharAlertDialog = (open: boolean) => {
    if (!open) {
      setConfirmandoUserId(null);
      clearRemoveError();
    }
  };

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
                Convide colaboradores por e-mail e controle quem tem acesso à sua empresa.
              </CardDescription>
            </div>
            {isAdmin && (
              <Button type="button" className="shrink-0 gap-2" onClick={abrirConvite}>
                <PlusCircle className="h-4 w-4" />
                Convidar colaborador
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum acesso cadastrado. Use &quot;Convidar colaborador&quot; para incluir o primeiro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nomeCompleto}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              u.papel === 'ADMIN'
                                ? 'border-[#0050FF] text-[#0050FF] bg-[#EDF4FF]/80 dark:bg-[#0050FF]/15'
                                : ''
                            )}
                          >
                            {u.papel === 'ADMIN' ? 'Administrador' : 'Colaborador'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {u.userId !== currentUserId && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                aria-label={`Remover ${u.nomeCompleto}`}
                                disabled={removendoId === u.userId}
                                onClick={() => setConfirmandoUserId(u.userId)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {removeError && (
                <p className="text-sm text-destructive">{removeError}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Drawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
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
            <DrawerTitle className="text-lg">Convidar colaborador</DrawerTitle>
            <DrawerDescription>
              Informe o e-mail e o nome da pessoa que você deseja convidar. Ela receberá um link por e-mail para aceitar o acesso à sua empresa.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <form id="convidar-colaborador-form" className="grid gap-4" onSubmit={handleSubmitConvite}>
              {convidarSucesso && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-800">{convidarSucesso}</p>
                </div>
              )}
              {convidarError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">{convidarError}</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="convidar-colaborador-email">E-mail do colaborador</Label>
                <Input
                  id="convidar-colaborador-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  autoComplete="email"
                  placeholder="colaborador@empresa.com.br"
                  disabled={convidando}
                  required
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="convidar-colaborador-nome">Nome do colaborador</Label>
                <Input
                  id="convidar-colaborador-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setNomeError(null);
                  }}
                  autoComplete="name"
                  placeholder="Maria Souza"
                  disabled={convidando}
                  required
                />
                {nomeError && <p className="text-xs text-destructive">{nomeError}</p>}
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t border-border bg-background sm:flex-row sm:justify-end sm:gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline">Fechar</Button>
            </DrawerClose>
            <Button type="submit" form="convidar-colaborador-form" disabled={convidando}>
              {convidando ? 'Enviando...' : 'Enviar convite'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!confirmandoUserId} onOpenChange={handleFecharAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioParaRemover
                ? `O usuário "${usuarioParaRemover.nomeCompleto}" (${usuarioParaRemover.email}) perderá o acesso à organização. Esta ação não pode ser desfeita.`
                : 'Confirme a remoção deste acesso.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmarRemocao}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
