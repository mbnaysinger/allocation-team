import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Verifica a saúde da aplicação.
 *     description: Retorna um status 'ok' para indicar que o serviço está no ar. Útil para liveness probes.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: A aplicação está saudável.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
} 