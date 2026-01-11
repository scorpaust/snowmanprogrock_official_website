import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface CustomerAuthProps {
  language: string;
}

export default function CustomerAuth({ language }: CustomerAuthProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const t = {
    title: { pt: "Área de Cliente", en: "Customer Area", fr: "Espace Client", es: "Área de Cliente", de: "Kundenbereich" },
    login: { pt: "Entrar", en: "Login", fr: "Connexion", es: "Iniciar Sesión", de: "Anmelden" },
    register: { pt: "Registar", en: "Register", fr: "S'inscrire", es: "Registrarse", de: "Registrieren" },
    email: { pt: "Email", en: "Email", fr: "Email", es: "Email", de: "E-Mail" },
    password: { pt: "Palavra-passe", en: "Password", fr: "Mot de passe", es: "Contraseña", de: "Passwort" },
    confirmPassword: { pt: "Confirmar palavra-passe", en: "Confirm password", fr: "Confirmer le mot de passe", es: "Confirmar contraseña", de: "Passwort bestätigen" },
    name: { pt: "Nome", en: "Name", fr: "Nom", es: "Nombre", de: "Name" },
    loginBtn: { pt: "Entrar", en: "Sign In", fr: "Se Connecter", es: "Entrar", de: "Anmelden" },
    registerBtn: { pt: "Criar Conta", en: "Create Account", fr: "Créer un Compte", es: "Crear Cuenta", de: "Konto Erstellen" },
    loginDesc: { pt: "Acede à tua área de cliente", en: "Access your customer area", fr: "Accédez à votre espace client", es: "Accede a tu área de cliente", de: "Greifen Sie auf Ihren Kundenbereich zu" },
    registerDesc: { pt: "Cria uma conta para comentar e fazer compras", en: "Create an account to comment and shop", fr: "Créez un compte pour commenter et acheter", es: "Crea una cuenta para comentar y comprar", de: "Erstellen Sie ein Konto zum Kommentieren und Einkaufen" },
    loginSuccess: { pt: "Sessão iniciada com sucesso!", en: "Logged in successfully!", fr: "Connexion réussie!", es: "¡Sesión iniciada!", de: "Erfolgreich angemeldet!" },
    registerSuccess: { pt: "Conta criada com sucesso!", en: "Account created successfully!", fr: "Compte créé avec succès!", es: "¡Cuenta creada!", de: "Konto erfolgreich erstellt!" },
    error: { pt: "Erro", en: "Error", fr: "Erreur", es: "Error", de: "Fehler" },
    passwordMismatch: { pt: "As palavras-passe não coincidem", en: "Passwords don't match", fr: "Les mots de passe ne correspondent pas", es: "Las contraseñas no coinciden", de: "Passwörter stimmen nicht überein" },
    processing: { pt: "A processar...", en: "Processing...", fr: "Traitement...", es: "Procesando...", de: "Verarbeitung..." },
  };

  const translate = (key: Record<string, string>) => key[language] || key.pt;

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/customer/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/me'] });
      toast({ title: translate(t.loginSuccess) });
      setLocation("/cliente");
    },
    onError: (error: any) => {
      toast({ title: translate(t.error), description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/customer/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/me'] });
      toast({ title: translate(t.registerSuccess) });
      setLocation("/cliente");
    },
    onError: (error: any) => {
      toast({ title: translate(t.error), description: error.message, variant: "destructive" });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: translate(t.error), description: translate(t.passwordMismatch), variant: "destructive" });
      return;
    }
    registerMutation.mutate({ name: registerData.name, email: registerData.email, password: registerData.password });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center" data-testid="text-auth-title">
          {translate(t.title)}
        </h1>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">{translate(t.login)}</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">{translate(t.register)}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{translate(t.login)}</CardTitle>
                <CardDescription>{translate(t.loginDesc)}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{translate(t.email)}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-login-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{translate(t.password)}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                    {loginMutation.isPending ? translate(t.processing) : translate(t.loginBtn)}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>{translate(t.register)}</CardTitle>
                <CardDescription>{translate(t.registerDesc)}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{translate(t.name)}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-register-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{translate(t.email)}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{translate(t.password)}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                        data-testid="input-register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">{translate(t.confirmPassword)}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type={showPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                        data-testid="input-register-confirm"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register">
                    {registerMutation.isPending ? translate(t.processing) : translate(t.registerBtn)}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
