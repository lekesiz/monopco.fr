import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Page précédente
          </Button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.
          </p>
          <a 
            href="mailto:contact@netzinformatique.fr" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            contact@netzinformatique.fr
          </a>
        </div>
      </div>
    </div>
  );
}
