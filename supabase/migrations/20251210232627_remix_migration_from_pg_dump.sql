CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: trades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket text NOT NULL,
    open_time timestamp with time zone NOT NULL,
    type text NOT NULL,
    size numeric NOT NULL,
    symbol text NOT NULL,
    open_price numeric NOT NULL,
    close_time timestamp with time zone NOT NULL,
    close_price numeric NOT NULL,
    commission numeric DEFAULT 0,
    swap numeric DEFAULT 0,
    profit numeric NOT NULL,
    net_profit numeric NOT NULL,
    duration numeric NOT NULL,
    is_win boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    CONSTRAINT trades_type_check CHECK ((type = ANY (ARRAY['buy'::text, 'sell'::text])))
);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: idx_trades_close_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trades_close_time ON public.trades USING btree (close_time DESC);


--
-- Name: idx_trades_symbol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trades_symbol ON public.trades USING btree (symbol);


--
-- Name: trades trades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trades Users can delete their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own trades" ON public.trades FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: trades Users can insert their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: trades Users can update their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own trades" ON public.trades FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: trades Users can view their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: trades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


