import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';
import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type = 'dossiers' } = req.query;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MonOPCO';
    workbook.created = new Date();

    if (type === 'dossiers') {
      // Export dossiers
      const result = await query(`
        SELECT d.id, d.type_dossier, d.statut, d.beneficiaire_nom, d.beneficiaire_prenom,
               d.beneficiaire_email, d.montant_estime, d.heures_total, d.heures_realisees,
               d.date_debut, d.date_fin, d.created_at,
               e.nom as entreprise_nom, e.siret
        FROM dossiers d
        LEFT JOIN entreprises e ON d.entreprise_id = e.id
        ORDER BY d.created_at DESC
      `);

      const worksheet = workbook.addWorksheet('Dossiers');

      // Header
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Type', key: 'type_dossier', width: 15 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Nom', key: 'beneficiaire_nom', width: 20 },
        { header: 'Prénom', key: 'beneficiaire_prenom', width: 20 },
        { header: 'Email', key: 'beneficiaire_email', width: 30 },
        { header: 'Entreprise', key: 'entreprise_nom', width: 30 },
        { header: 'SIRET', key: 'siret', width: 20 },
        { header: 'Montant (€)', key: 'montant_estime', width: 15 },
        { header: 'Heures Total', key: 'heures_total', width: 15 },
        { header: 'Heures Réalisées', key: 'heures_realisees', width: 15 },
        { header: 'Date Début', key: 'date_debut', width: 15 },
        { header: 'Date Fin', key: 'date_fin', width: 15 },
        { header: 'Date Création', key: 'created_at', width: 20 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Add data
      result.rows.forEach(row => {
        worksheet.addRow({
          ...row,
          date_debut: row.date_debut ? new Date(row.date_debut).toLocaleDateString('fr-FR') : '',
          date_fin: row.date_fin ? new Date(row.date_fin).toLocaleDateString('fr-FR') : '',
          created_at: new Date(row.created_at).toLocaleDateString('fr-FR')
        });
      });

    } else if (type === 'factures') {
      // Export factures
      const result = await query(`
        SELECT f.numero_facture, f.montant, f.statut, f.date_echeance, f.created_at,
               d.beneficiaire_nom, d.beneficiaire_prenom,
               e.nom as entreprise_nom
        FROM factures f
        LEFT JOIN dossiers d ON f.dossier_id = d.id
        LEFT JOIN entreprises e ON d.entreprise_id = e.id
        ORDER BY f.created_at DESC
      `);

      const worksheet = workbook.addWorksheet('Factures');

      worksheet.columns = [
        { header: 'N° Facture', key: 'numero_facture', width: 20 },
        { header: 'Montant (€)', key: 'montant', width: 15 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Bénéficiaire', key: 'beneficiaire', width: 30 },
        { header: 'Entreprise', key: 'entreprise_nom', width: 30 },
        { header: 'Date Échéance', key: 'date_echeance', width: 20 },
        { header: 'Date Création', key: 'created_at', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      result.rows.forEach(row => {
        worksheet.addRow({
          ...row,
          beneficiaire: `${row.beneficiaire_prenom} ${row.beneficiaire_nom}`,
          date_echeance: row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '',
          created_at: new Date(row.created_at).toLocaleDateString('fr-FR')
        });
      });
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="export-${type}-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Excel export error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
