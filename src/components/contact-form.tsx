"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo válida.",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }),
});

type ContactFormProps = {
  defaultEmail?: string;
  /** Si true, envía el mensaje a /api/support (requiere sesión). */
  supportMode?: boolean;
};

export default function ContactForm({ defaultEmail = "", supportMode = false }: ContactFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: defaultEmail,
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (supportMode) {
      try {
        const res = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast({
            variant: "destructive",
            title: "No se pudo enviar",
            description: typeof data.error === "string" ? data.error : "Intenta de nuevo.",
          });
          return;
        }
        toast({
          title: "Mensaje enviado",
          description: "Gracias. Te responderemos pronto por correo.",
        });
        form.reset({ name: "", email: values.email, message: "" });
      } catch {
        toast({
          variant: "destructive",
          title: "Error de red",
          description: "Comprueba tu conexión e intenta de nuevo.",
        });
      }
      return;
    }

    toast({
      title: "Mensaje recibido",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input placeholder="tu@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="¿En qué podemos ayudarte?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full cursor-pointer" size="lg">
          Enviar mensaje
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
