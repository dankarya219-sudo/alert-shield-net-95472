--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: app_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    app_name text NOT NULL,
    package_name text,
    usage_date date DEFAULT CURRENT_DATE NOT NULL,
    duration_minutes integer DEFAULT 0 NOT NULL,
    times_opened integer DEFAULT 0 NOT NULL,
    last_used timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blocked_apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_apps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    child_id uuid NOT NULL,
    parent_id uuid NOT NULL,
    app_name text NOT NULL,
    package_name text,
    is_blocked boolean DEFAULT true NOT NULL,
    blocked_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: danger_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danger_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    incident_type text NOT NULL,
    description text,
    severity text DEFAULT 'medium'::text,
    created_at timestamp with time zone DEFAULT now(),
    verified boolean DEFAULT false,
    CONSTRAINT danger_zones_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
);


--
-- Name: emergency_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    alert_type text NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    CONSTRAINT emergency_alerts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'resolved'::text, 'false_alarm'::text])))
);


--
-- Name: family_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    child_id uuid,
    connection_code text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT family_connections_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])))
);


--
-- Name: geofence_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geofence_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    safe_zone_id uuid NOT NULL,
    event_type text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT geofence_alerts_event_type_check CHECK ((event_type = ANY (ARRAY['entry'::text, 'exit'::text])))
);


--
-- Name: geofence_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geofence_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    safe_zone_id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_type text NOT NULL,
    location_latitude double precision NOT NULL,
    location_longitude double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT geofence_events_event_type_check CHECK ((event_type = ANY (ARRAY['entry'::text, 'exit'::text])))
);


--
-- Name: parental_controls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parental_controls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    child_id uuid,
    screen_time_limit integer DEFAULT 480,
    school_mode_enabled boolean DEFAULT false,
    school_mode_start time without time zone DEFAULT '08:00:00'::time without time zone,
    school_mode_end time without time zone DEFAULT '15:00:00'::time without time zone,
    bedtime_mode_enabled boolean DEFAULT false,
    bedtime_start time without time zone DEFAULT '22:00:00'::time without time zone,
    bedtime_end time without time zone DEFAULT '06:00:00'::time without time zone,
    social_media_blocked boolean DEFAULT false,
    location_tracking_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    phone_number text,
    emergency_contact text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: safe_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safe_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    name text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    radius_meters integer DEFAULT 100 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notify_on_entry boolean DEFAULT true NOT NULL,
    notify_on_exit boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: screen_time_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screen_time_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    alert_type text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: screen_time_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screen_time_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    duration_minutes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy double precision,
    battery_level integer,
    "timestamp" timestamp with time zone DEFAULT now()
);


--
-- Name: app_usage app_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_usage
    ADD CONSTRAINT app_usage_pkey PRIMARY KEY (id);


--
-- Name: blocked_apps blocked_apps_child_id_package_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_apps
    ADD CONSTRAINT blocked_apps_child_id_package_name_key UNIQUE (child_id, package_name);


--
-- Name: blocked_apps blocked_apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_apps
    ADD CONSTRAINT blocked_apps_pkey PRIMARY KEY (id);


--
-- Name: danger_zones danger_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danger_zones
    ADD CONSTRAINT danger_zones_pkey PRIMARY KEY (id);


--
-- Name: emergency_alerts emergency_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id);


--
-- Name: family_connections family_connections_connection_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_connections
    ADD CONSTRAINT family_connections_connection_code_key UNIQUE (connection_code);


--
-- Name: family_connections family_connections_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_connections
    ADD CONSTRAINT family_connections_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: family_connections family_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_connections
    ADD CONSTRAINT family_connections_pkey PRIMARY KEY (id);


--
-- Name: geofence_alerts geofence_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_alerts
    ADD CONSTRAINT geofence_alerts_pkey PRIMARY KEY (id);


--
-- Name: geofence_events geofence_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_events
    ADD CONSTRAINT geofence_events_pkey PRIMARY KEY (id);


--
-- Name: parental_controls parental_controls_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_controls
    ADD CONSTRAINT parental_controls_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: parental_controls parental_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_controls
    ADD CONSTRAINT parental_controls_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: safe_zones safe_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safe_zones
    ADD CONSTRAINT safe_zones_pkey PRIMARY KEY (id);


--
-- Name: screen_time_alerts screen_time_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screen_time_alerts
    ADD CONSTRAINT screen_time_alerts_pkey PRIMARY KEY (id);


--
-- Name: screen_time_sessions screen_time_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screen_time_sessions
    ADD CONSTRAINT screen_time_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_locations user_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_pkey PRIMARY KEY (id);


--
-- Name: idx_alerts_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_user_read ON public.screen_time_alerts USING btree (user_id, is_read);


--
-- Name: idx_app_usage_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_usage_user_date ON public.app_usage USING btree (user_id, usage_date);


--
-- Name: idx_blocked_apps_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_apps_child ON public.blocked_apps USING btree (child_id, is_blocked);


--
-- Name: idx_geofence_alerts_parent_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_geofence_alerts_parent_read ON public.geofence_alerts USING btree (parent_id, is_read);


--
-- Name: idx_geofence_events_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_geofence_events_user ON public.geofence_events USING btree (user_id);


--
-- Name: idx_geofence_events_zone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_geofence_events_zone ON public.geofence_events USING btree (safe_zone_id);


--
-- Name: idx_safe_zones_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_safe_zones_child ON public.safe_zones USING btree (child_id);


--
-- Name: idx_safe_zones_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_safe_zones_parent ON public.safe_zones USING btree (parent_id);


--
-- Name: idx_screen_time_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_screen_time_user_date ON public.screen_time_sessions USING btree (user_id, started_at);


--
-- Name: parental_controls update_parental_controls_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_parental_controls_updated_at BEFORE UPDATE ON public.parental_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: safe_zones update_safe_zones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_safe_zones_updated_at BEFORE UPDATE ON public.safe_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: danger_zones danger_zones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danger_zones
    ADD CONSTRAINT danger_zones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: emergency_alerts emergency_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: family_connections family_connections_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_connections
    ADD CONSTRAINT family_connections_child_id_fkey FOREIGN KEY (child_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: family_connections family_connections_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_connections
    ADD CONSTRAINT family_connections_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: geofence_alerts geofence_alerts_safe_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_alerts
    ADD CONSTRAINT geofence_alerts_safe_zone_id_fkey FOREIGN KEY (safe_zone_id) REFERENCES public.safe_zones(id) ON DELETE CASCADE;


--
-- Name: geofence_events geofence_events_safe_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geofence_events
    ADD CONSTRAINT geofence_events_safe_zone_id_fkey FOREIGN KEY (safe_zone_id) REFERENCES public.safe_zones(id) ON DELETE CASCADE;


--
-- Name: parental_controls parental_controls_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_controls
    ADD CONSTRAINT parental_controls_child_id_fkey FOREIGN KEY (child_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: parental_controls parental_controls_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_controls
    ADD CONSTRAINT parental_controls_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_locations user_locations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: danger_zones Anyone can view danger zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view danger zones" ON public.danger_zones FOR SELECT USING (true);


--
-- Name: danger_zones Authenticated users can report danger zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can report danger zones" ON public.danger_zones FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blocked_apps Children can view their blocked apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Children can view their blocked apps" ON public.blocked_apps FOR SELECT USING ((auth.uid() = child_id));


--
-- Name: parental_controls Children can view their controls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Children can view their controls" ON public.parental_controls FOR SELECT USING ((auth.uid() = child_id));


--
-- Name: safe_zones Children can view their safe zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Children can view their safe zones" ON public.safe_zones FOR SELECT USING ((auth.uid() = child_id));


--
-- Name: family_connections Parents can create connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can create connections" ON public.family_connections FOR INSERT WITH CHECK ((auth.uid() = parent_id));


--
-- Name: blocked_apps Parents can manage blocked apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can manage blocked apps" ON public.blocked_apps USING ((auth.uid() = parent_id));


--
-- Name: safe_zones Parents can manage their children's safe zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can manage their children's safe zones" ON public.safe_zones USING ((auth.uid() = parent_id));


--
-- Name: parental_controls Parents can manage their controls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can manage their controls" ON public.parental_controls USING ((auth.uid() = parent_id));


--
-- Name: geofence_alerts Parents can update their alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can update their alerts" ON public.geofence_alerts FOR UPDATE USING ((auth.uid() = parent_id));


--
-- Name: app_usage Parents can view child app usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view child app usage" ON public.app_usage FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.family_connections
  WHERE ((family_connections.parent_id = auth.uid()) AND (family_connections.child_id = app_usage.user_id) AND (family_connections.status = 'active'::text)))));


--
-- Name: geofence_events Parents can view child events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view child events" ON public.geofence_events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.safe_zones
  WHERE ((safe_zones.id = geofence_events.safe_zone_id) AND (safe_zones.parent_id = auth.uid())))));


--
-- Name: screen_time_sessions Parents can view child sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view child sessions" ON public.screen_time_sessions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.family_connections
  WHERE ((family_connections.parent_id = auth.uid()) AND (family_connections.child_id = screen_time_sessions.user_id) AND (family_connections.status = 'active'::text)))));


--
-- Name: geofence_alerts Parents can view their alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view their alerts" ON public.geofence_alerts FOR SELECT USING ((auth.uid() = parent_id));


--
-- Name: family_connections Parents can view their connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view their connections" ON public.family_connections FOR SELECT USING (((auth.uid() = parent_id) OR (auth.uid() = child_id)));


--
-- Name: geofence_alerts System can insert alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert alerts" ON public.geofence_alerts FOR INSERT WITH CHECK (true);


--
-- Name: screen_time_alerts System can insert alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert alerts" ON public.screen_time_alerts FOR INSERT WITH CHECK (true);


--
-- Name: emergency_alerts Users can create own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own alerts" ON public.emergency_alerts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_locations Users can insert own location; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own location" ON public.user_locations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: app_usage Users can insert their own app usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own app usage" ON public.app_usage FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: geofence_events Users can insert their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own events" ON public.geofence_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: screen_time_sessions Users can insert their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own sessions" ON public.screen_time_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: emergency_alerts Users can update own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own alerts" ON public.emergency_alerts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: family_connections Users can update their connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their connections" ON public.family_connections FOR UPDATE USING (((auth.uid() = parent_id) OR (auth.uid() = child_id)));


--
-- Name: screen_time_alerts Users can update their own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own alerts" ON public.screen_time_alerts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: app_usage Users can update their own app usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own app usage" ON public.app_usage FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: screen_time_sessions Users can update their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own sessions" ON public.screen_time_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_locations Users can view family member locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view family member locations" ON public.user_locations FOR SELECT USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.family_connections
  WHERE ((family_connections.parent_id = auth.uid()) AND (family_connections.child_id = user_locations.user_id) AND (family_connections.status = 'active'::text))))));


--
-- Name: emergency_alerts Users can view nearby alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view nearby alerts" ON public.emergency_alerts FOR SELECT USING ((status = 'active'::text));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: screen_time_alerts Users can view their own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own alerts" ON public.screen_time_alerts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: app_usage Users can view their own app usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own app usage" ON public.app_usage FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: geofence_events Users can view their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own events" ON public.geofence_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: screen_time_sessions Users can view their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sessions" ON public.screen_time_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: app_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_apps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_apps ENABLE ROW LEVEL SECURITY;

--
-- Name: danger_zones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.danger_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: emergency_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: family_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.family_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: geofence_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.geofence_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: geofence_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

--
-- Name: parental_controls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: safe_zones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: screen_time_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screen_time_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: screen_time_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screen_time_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


