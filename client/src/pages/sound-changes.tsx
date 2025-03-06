import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSoundChangeRuleSchema, type SoundChangeRule } from "@shared/schema";
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
import { applySoundChanges } from "@/lib/phonology";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";

export default function SoundChanges() {
  const { toast } = useToast();
  const [inputWord, setInputWord] = useState("");
  const [outputWord, setOutputWord] = useState("");

  const { data: rules = [] } = useQuery<SoundChangeRule[]>({
    queryKey: ["/api/sound-rules"],
  });

  const form = useForm({
    resolver: zodResolver(insertSoundChangeRuleSchema),
    defaultValues: {
      name: "",
      rules: [] as string[],
    },
  });

  const saveRule = useMutation({
    mutationFn: async (data: typeof insertSoundChangeRuleSchema._type) => {
      await apiRequest("POST", "/api/sound-rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sound-rules"] });
      form.reset();
      toast({
        title: "Rule saved",
        description: "Your sound change rule has been added",
      });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sound-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sound-rules"] });
      toast({
        title: "Rule deleted",
        description: "The sound change rule has been removed",
      });
    },
  });

  const handleApplyRules = () => {
    const allRules = rules.flatMap((rule) => rule.rules);
    const result = applySoundChanges(inputWord, allRules);
    setOutputWord(result);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sound Changes</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Sound Change Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => saveRule.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Palatalization" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sound Change Rules</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            {...field}
                            value={field.value.join("\n")}
                            onChange={(e) =>
                              field.onChange(e.target.value.split("\n"))
                            }
                            placeholder={`k > tʃ / _i\nh > Ø / V_V\ns > z / V_V`}
                          />
                          <div className="text-sm text-muted-foreground">
                            <p>Format: sound {`>`} result / environment</p>
                            <p>Examples:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Simple change: p {`>`} b</li>
                              <li>With environment: k {`>`} tʃ / _i (before i)</li>
                              <li>Delete: h {`>`} Ø / V_V (between vowels)</li>
                              <li>Classes: n {`>`} m / _[p,b,m] (before labials)</li>
                              <li>Use V for any vowel, C for any consonant</li>
                            </ul>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={saveRule.isPending}>
                  Save Rule
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apply Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder="Enter word"
                />
              </div>

              <Button onClick={handleApplyRules}>Apply Rules</Button>

              {outputWord && (
                <div className="p-4 bg-muted rounded-md">
                  <div className="font-mono">
                    Input: {inputWord}
                    <br />
                    Output: {outputWord}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Saved Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start justify-between p-4 bg-muted rounded-md"
                >
                  <div>
                    <h3 className="font-semibold">{rule.name}</h3>
                    <pre className="mt-2 text-sm">{rule.rules.join("\n")}</pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule.mutate(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}