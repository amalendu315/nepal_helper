import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ApiResponseAlert {
  title: string;
  response: string;
  variant: "default" | "destructive" | null | undefined;
}

export default function ApiResponseAlert({
  response,
  title,
  variant,
}: ApiResponseAlert) {
  return (
    <Alert variant={variant}>
      {variant === "destructive" ? <AlertCircle className="h-4 w-4" /> : <></>}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{response}</AlertDescription>
    </Alert>
  );
}
