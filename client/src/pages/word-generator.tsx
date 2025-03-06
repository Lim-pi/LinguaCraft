import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPhonologyConfigSchema, type PhonologyConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateWord, defaultPhonology } from "@/lib/phonology";
import { apiRequest } from "@/lib/queryClient";

export default function WordGenerator() {
  const { toast } = useToast();
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);

  const { data: config } = useQuery<PhonologyConfig>({
    queryKey: ["/api/phonology"],
  });

  const form = useForm({
    resolver: zodResolver(insertPhonologyConfigSchema),
    defaultValues: {
      consonants: defaultPhonology.consonants,
      vowels: defaultPhonology.vowels,
      syllablePatterns: defaultPhonology.syllablePatterns,
    },
  });

  // Update form when config data arrives
  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [config, form]);

  const saveConfig = useMutation({
    mutationFn: async (data: typeof insertPhonologyConfigSchema._type) => {
      await apiRequest("POST", "/api/phonology", data);
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Your phonology settings have been updated",
      });
    },
  });

  const handleGenerate = () => {
    const values = form.getValues();
    const newWords = Array.from({ length: 10 }, () => {
      const pattern = values.syllablePatterns[
        Math.floor(Math.random() * values.syllablePatterns.length)
      ];
      return generateWord(values.consonants, values.vowels, pattern);
    });
    setGeneratedWords(newWords);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Word Generator</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Phonology Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => saveConfig.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="consonants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consonants</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value?.join(" ") || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.split(/\s+/))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vowels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vowels</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value?.join(" ") || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.split(/\s+/))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syllablePatterns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syllable Patterns (C=consonant, V=vowel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value?.join(" ") || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.split(/\s+/))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={saveConfig.isPending}>
                    Save Configuration
                  </Button>
                  <Button type="button" onClick={handleGenerate}>
                    Generate Words
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {generatedWords.map((word, i) => (
                <div
                  key={i}
                  className="p-2 bg-muted rounded-md text-center font-mono"
                >
                  {word}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}