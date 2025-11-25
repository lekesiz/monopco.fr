import React from 'react';

const MentionsLegales: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mentions Légales</h1>
      <p className="mb-4">Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site MonOPCO.fr l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Édition du site</h2>
      <p>Le site MonOPCO.fr est édité par la société NETZ Informatique, société par actions simplifiée au capital de 10 000 euros, dont le siège social est situé 15 rue de la République, 67500 Haguenau, immatriculée au registre du commerce et des sociétés de Strasbourg sous le numéro 848 993 333.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Responsable de publication</h2>
      <p>Mikail Lekesiz, Président de NETZ Informatique.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Hébergement</h2>
      <p>Le site MonOPCO.fr est hébergé par Vercel Inc., situé 340 S Lemon Ave #4133 Walnut, CA 91789.</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Nous contacter</h2>
      <ul>
        <li>Par email : contact@monopco.fr</li>
        <li>Par téléphone : 03 67 31 02 01</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-2">CNIL</h2>
      <p>La société NETZ Informatique conservera dans ses systèmes informatiques et dans des conditions raisonnables de sécurité une preuve de la transaction comprenant le bon de commande et la facture. La société NETZ Informatique a fait l'objet d'une déclaration à la CNIL.</p>
    </div>
  );
};

export default MentionsLegales;
