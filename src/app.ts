import "dotenv/config";
import express from "express";
import type { Response } from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

const PORT = 3000;

// ==================== SUPABASE ====================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Defina SUPABASE_URL e SUPABASE_KEY no arquivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== TRATAMENTO DE ERROS DO BANCO ====================

interface ErroBanco {
    code?: string;
    message: string;
}

function erroBanco(res: Response, error: ErroBanco, msgRelacionamento?: string) {
    // 22P02 = texto que não é um UUID válido (ex: GET /filmes/abc)
    if (error.code === "22P02") {
        res.status(404).json({ erro: "Registro não encontrado" });
        return;
    }

    // 23503 = violação de chave estrangeira
    if (error.code === "23503") {
        res.status(409).json({
            erro: msgRelacionamento ?? "Violação de relacionamento entre tabelas",
        });
        return;
    }

    console.error(error);
    res.status(500).json({ erro: "Erro interno no servidor" });
}

// ==================== VALIDAÇÕES ====================

type Corpo = Record<string, unknown>;

function textoValido(valor: unknown): boolean {
    return typeof valor === "string" && valor.trim() !== "";
}

function validarFilme(body: Corpo): string[] {
    const erros: string[] = [];

    if (!textoValido(body.titulo)) {
        erros.push("titulo é obrigatório e deve ser um texto");
    }

    if (typeof body.descricao !== "string") {
        erros.push("descricao é obrigatória e deve ser um texto");
    }

    if (
        typeof body.duracao !== "number" ||
        !Number.isFinite(body.duracao) ||
        body.duracao <= 0
    ) {
        erros.push("duracao é obrigatória e deve ser um número maior que 0");
    }

    if (!textoValido(body.classificacao)) {
        erros.push("classificacao é obrigatória e deve ser um texto");
    }

    if (!textoValido(body.genero)) {
        erros.push("genero é obrigatório e deve ser um texto");
    }

    if (body.ativo !== undefined && typeof body.ativo !== "boolean") {
        erros.push("ativo deve ser true ou false");
    }

    return erros;
}

function validarSessao(body: Corpo): string[] {
    const erros: string[] = [];

    if (
        typeof body.data_hora !== "string" ||
        Number.isNaN(Date.parse(body.data_hora))
    ) {
        erros.push(
            "data_hora é obrigatória e deve ser uma data válida (ex: 2026-10-15T19:30:00)"
        );
    }

    if (!Number.isInteger(body.sala) || (body.sala as number) <= 0) {
        erros.push("sala é obrigatória e deve ser um número inteiro maior que 0");
    }

    if (!Number.isInteger(body.capacidade) || (body.capacidade as number) <= 0) {
        erros.push(
            "capacidade é obrigatória e deve ser um número inteiro maior que 0"
        );
    }

    if (
        typeof body.preco !== "number" ||
        !Number.isFinite(body.preco) ||
        body.preco < 0
    ) {
        erros.push("preco é obrigatório e deve ser um número maior ou igual a 0");
    }

    if (!textoValido(body.filme_id)) {
        erros.push("filme_id é obrigatório e deve ser um texto");
    }

    return erros;
}

// Monta o objeto que será gravado no banco (sem o id)
function dadosFilme(body: Corpo) {
    return {
        titulo: (body.titulo as string).trim(),
        descricao: body.descricao as string,
        duracao: body.duracao as number,
        classificacao: (body.classificacao as string).trim(),
        genero: (body.genero as string).trim(),
        ativo: (body.ativo as boolean | undefined) ?? true,
    };
}

function dadosSessao(body: Corpo) {
    return {
        data_hora: body.data_hora as string,
        sala: body.sala as number,
        capacidade: body.capacidade as number,
        preco: body.preco as number,
        filme_id: body.filme_id as string,
    };
}

// ==================== ROTA INICIAL ====================

app.get("/", (req, res) => {
    res.send("Filmes em cartaz e sessões");
});

// ==================== FILMES ====================

// Lista todos os filmes
app.get("/filmes", async (req, res) => {
    const { data, error } = await supabase.from("filmes").select("*");

    if (error) {
        erroBanco(res, error);
        return;
    }

    res.json(data);
});

// Busca filme pelo ID
app.get("/filmes/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("filmes")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();

    if (error) {
        erroBanco(res, error);
        return;
    }

    if (!data) {
        res.status(404).json({ erro: "Filme não encontrado" });
        return;
    }

    res.json(data);
});

// Cadastra filme
app.post("/filmes", async (req, res) => {
    const body = (req.body ?? {}) as Corpo;

    const erros = validarFilme(body);

    if (erros.length > 0) {
        res.status(400).json({ erros });
        return;
    }

    const { data, error } = await supabase
        .from("filmes")
        .insert(dadosFilme(body))
        .select()
        .single();

    if (error) {
        erroBanco(res, error);
        return;
    }

    res.status(201).json(data);
});

// Atualiza filme
app.put("/filmes/:id", async (req, res) => {
    const body = (req.body ?? {}) as Corpo;

    const erros = validarFilme(body);

    if (erros.length > 0) {
        res.status(400).json({ erros });
        return;
    }

    const { data, error } = await supabase
        .from("filmes")
        .update(dadosFilme(body))
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

    if (error) {
        erroBanco(res, error);
        return;
    }

    if (!data) {
        res.status(404).json({ erro: "Filme não encontrado" });
        return;
    }

    res.json(data);
});

// Exclui filme
app.delete("/filmes/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("filmes")
        .delete()
        .eq("id", req.params.id)
        .select();

    if (error) {
        erroBanco(
            res,
            error,
            "Não é possível excluir um filme que possui sessões cadastradas"
        );
        return;
    }

    if (data.length === 0) {
        res.status(404).json({ erro: "Filme não encontrado" });
        return;
    }

    res.status(204).send();
});

// Lista as sessões de um filme (relacionamento 1:N)
app.get("/filmes/:id/sessoes", async (req, res) => {
    const { data: filme, error: erroFilme } = await supabase
        .from("filmes")
        .select("id")
        .eq("id", req.params.id)
        .maybeSingle();

    if (erroFilme) {
        erroBanco(res, erroFilme);
        return;
    }

    if (!filme) {
        res.status(404).json({ erro: "Filme não encontrado" });
        return;
    }

    const { data, error } = await supabase
        .from("sessoes")
        .select("*")
        .eq("filme_id", req.params.id);

    if (error) {
        erroBanco(res, error);
        return;
    }

    res.json(data);
});

// ==================== SESSÕES ====================

// Lista todas as sessões
app.get("/sessoes", async (req, res) => {
    const { data, error } = await supabase.from("sessoes").select("*");

    if (error) {
        erroBanco(res, error);
        return;
    }

    res.json(data);
});

// Busca sessão pelo ID
app.get("/sessoes/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("sessoes")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();

    if (error) {
        erroBanco(res, error);
        return;
    }

    if (!data) {
        res.status(404).json({ erro: "Sessão não encontrada" });
        return;
    }

    res.json(data);
});

// Cadastra sessão
app.post("/sessoes", async (req, res) => {
    const body = (req.body ?? {}) as Corpo;

    const erros = validarSessao(body);

    if (erros.length > 0) {
        res.status(400).json({ erros });
        return;
    }

    const { data, error } = await supabase
        .from("sessoes")
        .insert(dadosSessao(body))
        .select()
        .single();

    if (error) {
        // Chave estrangeira inválida = filme_id não existe
        if (error.code === "23503" || error.code === "22P02") {
            res.status(400).json({
                erros: ["filme_id não corresponde a nenhum filme cadastrado"],
            });
            return;
        }

        erroBanco(res, error);
        return;
    }

    res.status(201).json(data);
});

// Atualiza sessão
app.put("/sessoes/:id", async (req, res) => {
    const body = (req.body ?? {}) as Corpo;

    const erros = validarSessao(body);

    if (erros.length > 0) {
        res.status(400).json({ erros });
        return;
    }

    const { data, error } = await supabase
        .from("sessoes")
        .update(dadosSessao(body))
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === "23503") {
            res.status(400).json({
                erros: ["filme_id não corresponde a nenhum filme cadastrado"],
            });
            return;
        }

        erroBanco(res, error);
        return;
    }

    if (!data) {
        res.status(404).json({ erro: "Sessão não encontrada" });
        return;
    }

    res.json(data);
});

// Exclui sessão
app.delete("/sessoes/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("sessoes")
        .delete()
        .eq("id", req.params.id)
        .select();

    if (error) {
        erroBanco(res, error);
        return;
    }

    if (data.length === 0) {
        res.status(404).json({ erro: "Sessão não encontrada" });
        return;
    }

    res.status(204).send();
});

// ==================== INICIA O SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});