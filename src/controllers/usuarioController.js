import * as usuarioService from "../services/usuarioService.js";
//import jwt from "jsonwebtoken";

export const registrarUsuario = async (req, res) => {
    console.log(req.body)
    try {
        const usuario = await usuarioService.registrarUsuario(req.body);
        res.status(201).json(usuario);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

