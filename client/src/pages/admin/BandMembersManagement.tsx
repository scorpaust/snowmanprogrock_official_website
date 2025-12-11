import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BandMember } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";

const memberFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  role: z.string().min(2, "A função deve ter pelo menos 2 caracteres"),
  roleEn: z.string().optional(),
  roleFr: z.string().optional(),
  roleEs: z.string().optional(),
  roleDe: z.string().optional(),
  image: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.union([z.literal(0), z.literal(1)]).default(1),
});

type MemberForm = z.infer<typeof memberFormSchema>;

export default function BandMembersManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BandMember | null>(null);

  const { data: members = [], isLoading } = useQuery<BandMember[]>({
    queryKey: ['/api/band-members'],
  });

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      role: "",
      roleEn: "",
      roleFr: "",
      roleEs: "",
      roleDe: "",
      image: "",
      displayOrder: 0,
      isActive: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MemberForm) => {
      const payload = {
        ...data,
        roleEn: data.roleEn || null,
        roleFr: data.roleFr || null,
        roleEs: data.roleEs || null,
        roleDe: data.roleDe || null,
        image: data.image || null,
      };
      const response = await apiRequest("POST", "/api/band-members", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/band-members'] });
      toast({ title: "Membro criado com sucesso" });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar membro", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MemberForm> }) => {
      const payload = {
        ...data,
        roleEn: data.roleEn || null,
        roleFr: data.roleFr || null,
        roleEs: data.roleEs || null,
        roleDe: data.roleDe || null,
        image: data.image || null,
      };
      const response = await apiRequest("PATCH", `/api/band-members/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/band-members'] });
      toast({ title: "Membro atualizado com sucesso" });
      setEditingMember(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar membro", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/band-members/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/band-members'] });
      toast({ title: "Membro eliminado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao eliminar membro", variant: "destructive" });
    },
  });

  const handleEdit = (member: BandMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      role: member.role,
      roleEn: member.roleEn || "",
      roleFr: member.roleFr || "",
      roleEs: member.roleEs || "",
      roleDe: member.roleDe || "",
      image: member.image || "",
      displayOrder: member.displayOrder,
      isActive: member.isActive as 0 | 1,
    });
  };

  const onSubmit = (data: MemberForm) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = (url: string) => {
    form.setValue("image", url);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const MemberFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do membro" {...field} data-testid="input-member-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Função (Multilingue)</FormLabel>
          <Tabs defaultValue="pt" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pt">PT *</TabsTrigger>
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="fr">FR</TabsTrigger>
              <TabsTrigger value="es">ES</TabsTrigger>
              <TabsTrigger value="de">DE</TabsTrigger>
            </TabsList>
            <TabsContent value="pt" className="mt-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Função (ex: Guitarra, Voz)" {...field} data-testid="input-role-pt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="en" className="mt-4">
              <FormField
                control={form.control}
                name="roleEn"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Role (e.g: Guitar, Vocals)" 
                        value={value ?? ""} 
                        onChange={onChange} 
                        {...rest} 
                        data-testid="input-role-en" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="fr" className="mt-4">
              <FormField
                control={form.control}
                name="roleFr"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Rôle (ex: Guitare, Chant)" 
                        value={value ?? ""} 
                        onChange={onChange} 
                        {...rest} 
                        data-testid="input-role-fr" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="es" className="mt-4">
              <FormField
                control={form.control}
                name="roleEs"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Rol (ej: Guitarra, Voz)" 
                        value={value ?? ""} 
                        onChange={onChange} 
                        {...rest} 
                        data-testid="input-role-es" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="de" className="mt-4">
              <FormField
                control={form.control}
                name="roleDe"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Rolle (z.B: Gitarre, Gesang)" 
                        value={value ?? ""} 
                        onChange={onChange} 
                        {...rest} 
                        data-testid="input-role-de" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotografia</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {field.value && (
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={field.value} alt="Preview" />
                        <AvatarFallback>{getInitials(form.watch("name") || "M")}</AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("image", "")}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                  <ObjectUploader
                    onUploadComplete={handleImageUpload}
                    acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
                  />
                  <Input
                    placeholder="Ou cole o URL da imagem"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    data-testid="input-member-image"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Exibição</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  data-testid="input-display-order"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  O membro será visível na página da banda
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 1}
                  onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                  data-testid="switch-is-active"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateOpen(false);
              setEditingMember(null);
              form.reset();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-submit-member"
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingMember ? "Guardar Alterações" : "Criar Membro"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestão de Membros</h1>
          <p className="text-muted-foreground">
            Gerir os membros da banda que aparecem na página "A Banda"
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Membro da Banda</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo membro. Os campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <MemberFormContent />
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum membro adicionado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione os membros da banda para que apareçam na página "A Banda"
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-first-member">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Membro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="relative" data-testid={`card-member-${member.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.image || undefined} alt={member.name} />
                    <AvatarFallback className="text-xl">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.isActive === 1 ? "default" : "secondary"}>
                      {member.isActive === 1 ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">Ordem: {member.displayOrder}</Badge>
                  </div>
                  <div className="flex gap-2 w-full pt-2 border-t">
                    <Dialog
                      open={editingMember?.id === member.id}
                      onOpenChange={(open) => !open && setEditingMember(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(member)}
                          data-testid={`button-edit-${member.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Membro</DialogTitle>
                          <DialogDescription>
                            Altere os dados do membro. Os campos marcados com * são obrigatórios.
                          </DialogDescription>
                        </DialogHeader>
                        <MemberFormContent />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          data-testid={`button-delete-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem a certeza que deseja eliminar o membro "{member.name}"? Esta ação não pode ser revertida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
