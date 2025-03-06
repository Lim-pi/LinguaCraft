import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLexiconEntrySchema, type LexiconEntry } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Save, Trash2, X } from "lucide-react";

export default function Lexicon() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customCategory, setCustomCategory] = useState<string>("");
  const [editingCustomCategory, setEditingCustomCategory] = useState<string>("");

  const { data: entries = [] } = useQuery<LexiconEntry[]>({
    queryKey: ["/api/lexicon"],
  });

  const form = useForm({
    resolver: zodResolver(insertLexiconEntrySchema),
    defaultValues: {
      word: "",
      definition: "",
      category: "noun",
      notes: "",
    },
  });

  const addEntry = useMutation({
    mutationFn: async (data: typeof insertLexiconEntrySchema._type) => {
      await apiRequest("POST", "/api/lexicon", {
        ...data,
        category: data.category === "other" ? customCategory : data.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lexicon"] });
      form.reset();
      setCustomCategory("");
      toast({
        title: "Entry added",
        description: "The word has been added to your lexicon",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof insertLexiconEntrySchema._type }) => {
      await apiRequest("PUT", `/api/lexicon/${id}`, {
        ...data,
        category: data.category === "other" ? editingCustomCategory : data.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lexicon"] });
      setEditingId(null);
      setEditingCustomCategory("");
      toast({
        title: "Entry updated",
        description: "The word has been updated in your lexicon",
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/lexicon/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lexicon"] });
      toast({
        title: "Entry deleted",
        description: "The word has been removed from your lexicon",
      });
    },
  });

  const categories = ["noun", "verb", "adjective", "adverb", "other"] as const;

  const handleCategoryChange = (value: string) => {
    form.setValue("category", value);
    if (value !== "other") {
      setCustomCategory("");
    }
  };

  const handleEditingCategoryChange = (value: string, entry: LexiconEntry) => {
    form.setValue("category", value);
    if (value === "other") {
      setEditingCustomCategory(entry.category);
    } else {
      setEditingCustomCategory("");
    }
  };

  const startEditing = (entry: LexiconEntry) => {
    setEditingId(entry.id);
    form.reset({
      word: entry.word,
      definition: entry.definition,
      category: categories.includes(entry.category as any) ? entry.category : "other",
      notes: entry.notes || "",
    });
    if (!categories.includes(entry.category as any)) {
      setEditingCustomCategory(entry.category);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lexicon</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Word</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => addEntry.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="word"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter word" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="definition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Definition</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter definition" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={handleCategoryChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value === "other" && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                        />
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={addEntry.isPending}>
                  Add to Lexicon
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Word List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-muted rounded-md relative group"
                >
                  {editingId === entry.id ? (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit((data) =>
                          updateEntry.mutate({ id: entry.id, data })
                        )}
                        className="space-y-2"
                      >
                        <Input
                          {...form.register("word")}
                          defaultValue={entry.word}
                        />
                        <Textarea
                          {...form.register("definition")}
                          defaultValue={entry.definition}
                        />
                        <Select
                          onValueChange={(value) =>
                            handleEditingCategoryChange(value, entry)
                          }
                          defaultValue={categories.includes(entry.category as any) ? entry.category : "other"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.watch("category") === "other" && (
                          <Input
                            placeholder="Enter custom category"
                            value={editingCustomCategory}
                            onChange={(e) => setEditingCustomCategory(e.target.value)}
                          />
                        )}
                        <Textarea
                          {...form.register("notes")}
                          defaultValue={entry.notes || ""}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditingCustomCategory("");
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{entry.word}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.definition}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm mt-2 text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEntry.mutate(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}