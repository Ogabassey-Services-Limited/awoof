/**
 * Swagger documentation for University Routes
 */

/**
 * @swagger
 * tags:
 *   - name: Universities
 *     description: University listing and verification methods endpoints
 */

/**
 * @swagger
 * /api/universities:
 *   get:
 *     summary: List all active universities
 *     tags: [Universities]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *         example: Nigeria
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by university name or domain
 *         example: Lagos
 *     responses:
 *       200:
 *         description: Universities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         universities:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: University of Lagos
 *                               domain:
 *                                 type: string
 *                                 example: unilag.edu.ng
 *                               country:
 *                                 type: string
 *                                 example: Nigeria
 *                               portalUrl:
 *                                 type: string
 *                                 nullable: true
 *                               databaseApiUrl:
 *                                 type: string
 *                                 nullable: true
 *                               isActive:
 *                                 type: boolean
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         total:
 *                           type: integer
 */

/**
 * @swagger
 * /api/universities/{id}/verification-methods:
 *   get:
 *     summary: Get available verification methods for a university
 *     tags: [Universities]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: University ID
 *     responses:
 *       200:
 *         description: Verification methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         university:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                         verificationMethods:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               methodType:
 *                                 type: string
 *                                 enum: [portal, email, registration, whatsapp]
 *                               apiEndpoint:
 *                                 type: string
 *                                 nullable: true
 *                               apiConfig:
 *                                 type: object
 *                                 nullable: true
 *                               isActive:
 *                                 type: boolean
 *                               priorityOrder:
 *                                 type: integer
 *       404:
 *         description: University not found
 */

