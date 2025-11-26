import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-lg shadow-lg border border-gray-200">
        <CardContent className="p-8 text-center space-y-6">
          
          {/* Icon */}
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500 drop-shadow-sm" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm">
            Looks like this page doesn’t exist. It may have been moved or removed.
          </p>

          {/* 404 Visual Code */}
          <div className="text-7xl font-extrabold text-gray-200 tracking-widest select-none">
            404
          </div>

          {/* Button */}
          <Link href="/">
            <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
              bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition">
              <ArrowLeft className="h-4 w-4" />
              Go Back Home
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
