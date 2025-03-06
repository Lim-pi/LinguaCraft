import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, Wand2, ScrollText } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Conlang Construction Kit
        </h1>
        <p className="text-lg text-muted-foreground">
          Create and evolve your constructed language with our comprehensive toolkit
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/word-generator">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Word Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              Generate words based on custom phonology and syllable patterns
            </CardContent>
          </Card>
        </Link>

        <Link href="/sound-changes">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Sound Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              Apply sound change rules to evolve your language systematically
            </CardContent>
          </Card>
        </Link>

        <Link href="/lexicon">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookText className="h-5 w-5" />
                Lexicon
              </CardTitle>
            </CardHeader>
            <CardContent>
              Manage and organize your language's vocabulary
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
