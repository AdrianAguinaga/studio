
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, PlusSquare, Loader2 } from 'lucide-react';
import { suggestTasks, type SuggestTasksInput } from '@/ai/flows/suggest-tasks';
import { useToast } from "@/hooks/use-toast";

interface AiTaskSuggesterProps {
  onAddSuggestedTask: (text: string) => void;
}

export const AiTaskSuggester: FC<AiTaskSuggesterProps> = ({ onAddSuggestedTask }) => {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a topic to get suggestions.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const input: SuggestTasksInput = { topic };
      const result = await suggestTasks(input);
      setSuggestions(result);
      if (result.length === 0) {
        toast({ title: "No Suggestions", description: "The AI couldn't find any suggestions for this topic." });
      } else {
        toast({ title: "Suggestions Loaded!", description: `Found ${result.length} task(s) for you.`, variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({ title: "AI Error", description: "Failed to get suggestions. Please try again.", variant: "destructive" });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestionText: string) => {
    onAddSuggestedTask(suggestionText);
    setSuggestions(prev => prev.filter(s => s !== suggestionText)); // Remove added suggestion from the list
    toast({ title: "Task Added!", description: `"${suggestionText}" added to your list.`, variant: "default" });
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Task Suggester
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Feeling stuck? Describe a topic or concern, and let AI draft your To-Do list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Plan a birthday party, Learn Next.js"
            className="flex-grow"
            aria-label="Topic for AI suggestions"
            disabled={isLoading}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateSuggestions(); }}
          />
          <Button onClick={handleGenerateSuggestions} disabled={isLoading} aria-label="Generate AI suggestions" className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Suggest Tasks
          </Button>
        </div>

        {isLoading && suggestions.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin inline-block mb-2" />
            <p>Generating suggestions...</p>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-muted-foreground mb-2">Suggested Tasks:</h3>
            <ScrollArea className="h-48 rounded-md border p-2 bg-background/50">
              <ul className="list-none p-0 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center justify-between p-2 hover:bg-secondary/80 rounded-md transition-colors text-sm">
                    <span className="flex-grow mr-2 break-words">{suggestion}</span>
                    <Button variant="outline" size="sm" onClick={() => handleAddSuggestion(suggestion)} aria-label={`Add suggested task: ${suggestion}`} className="shrink-0">
                      <PlusSquare className="mr-1 h-4 w-4" /> Add
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
