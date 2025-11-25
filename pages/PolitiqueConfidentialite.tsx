import React from 'react';

const PolitiqueConfidentialite: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Politique de Confidentialité</h1>
      <p>La présente Politique de confidentialité décrit la manière dont vos informations personnelles sont collectées, utilisées et partagées lorsque vous visitez ou effectuez un achat sur MonOPCO.fr (le « Site »).</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Informations personnelles que nous collectons</h2>
      <p>Lorsque vous visitez le Site, nous collectons automatiquement certaines informations sur votre appareil, notamment des informations sur votre navigateur Web, votre adresse IP, votre fuseau horaire et certains des cookies installés sur votre appareil.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Comment utilisons-nous vos informations personnelles ?</h2>
      <p>Nous utilisons les informations que nous collectons pour communiquer avec vous, optimiser notre Site et vous fournir des informations ou des publicités concernant nos produits ou services.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Partage de vos informations personnelles</h2>
      <p>Nous partageons vos Informations personnelles avec des tiers pour nous aider à utiliser vos Informations personnelles, comme décrit ci-dessus. Par exemple, nous utilisons Vercel pour héberger notre site.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Vos droits</h2>
      <p>Si vous êtes un résident européen, vous disposez d'un droit d'accès aux informations personnelles que nous détenons à votre sujet et de demander que vos informations personnelles soient corrigées, mises à jour ou supprimées.</p>
    </div>
  );
};

export default PolitiqueConfidentialite;
