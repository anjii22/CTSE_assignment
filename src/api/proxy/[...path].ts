import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const BASE_URL = process.env.VITE_API_BASE_URL!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = req.query.path;

    const endpoint = Array.isArray(path) ? path.join("/") : path;

    const url = `${BASE_URL}/${endpoint}`;

    // Remove "path" from query params
    const { path: _, ...query } = req.query;

    const response = await axios({
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: undefined,
      },
      data: req.body,
      params: query,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      message: error.message,
      error: error.response?.data,
    });
  }
}