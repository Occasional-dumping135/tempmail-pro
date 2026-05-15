--
-- PostgreSQL database dump
--

\restrict eoszeLxfKSJ6v31HK1iYxtQSSiandbK9CVjRGVr5vzfHwsBbC12O4us25PRWozN

-- Dumped from database version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_keys; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.access_keys (
    id integer NOT NULL,
    token_id integer NOT NULL,
    key_hash character varying(64) NOT NULL,
    key_prefix character varying(12) NOT NULL,
    name character varying(100) DEFAULT 'Default Key'::character varying,
    is_active boolean DEFAULT true,
    last_used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.access_keys OWNER TO mailtemp;

--
-- Name: access_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.access_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.access_keys_id_seq OWNER TO mailtemp;

--
-- Name: access_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.access_keys_id_seq OWNED BY public.access_keys.id;


--
-- Name: api_logs; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.api_logs (
    id integer NOT NULL,
    token_id integer,
    endpoint character varying(255),
    tokens_consumed integer DEFAULT 0,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.api_logs OWNER TO mailtemp;

--
-- Name: api_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.api_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_logs_id_seq OWNER TO mailtemp;

--
-- Name: api_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.api_logs_id_seq OWNED BY public.api_logs.id;


--
-- Name: emails; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.emails (
    id integer NOT NULL,
    token_id integer,
    address character varying(255) NOT NULL,
    subdomain character varying(50) NOT NULL,
    full_address character varying(320) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '24:00:00'::interval)
);


ALTER TABLE public.emails OWNER TO mailtemp;

--
-- Name: emails_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.emails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.emails_id_seq OWNER TO mailtemp;

--
-- Name: emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.emails_id_seq OWNED BY public.emails.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    email_id integer,
    sender character varying(320) NOT NULL,
    subject text,
    body_text text,
    body_html text,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO mailtemp;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO mailtemp;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: sent_mails; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.sent_mails (
    id integer NOT NULL,
    email_id integer NOT NULL,
    token_id integer NOT NULL,
    from_address character varying(255) NOT NULL,
    to_address character varying(255) NOT NULL,
    subject character varying(500),
    body_text text,
    status character varying(20) DEFAULT 'queued'::character varying,
    error text,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sent_mails OWNER TO mailtemp;

--
-- Name: sent_mails_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.sent_mails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sent_mails_id_seq OWNER TO mailtemp;

--
-- Name: sent_mails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.sent_mails_id_seq OWNED BY public.sent_mails.id;


--
-- Name: token_usage; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.token_usage (
    id integer NOT NULL,
    token_id integer,
    usage_date date DEFAULT CURRENT_DATE,
    calls_count integer DEFAULT 0,
    last_reset timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.token_usage OWNER TO mailtemp;

--
-- Name: token_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.token_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.token_usage_id_seq OWNER TO mailtemp;

--
-- Name: token_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.token_usage_id_seq OWNED BY public.token_usage.id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: mailtemp
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    token character varying(64) NOT NULL,
    token_hash character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    daily_limit integer DEFAULT 200000,
    is_active boolean DEFAULT true
);


ALTER TABLE public.tokens OWNER TO mailtemp;

--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: mailtemp
--

CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tokens_id_seq OWNER TO mailtemp;

--
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailtemp
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- Name: access_keys id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.access_keys ALTER COLUMN id SET DEFAULT nextval('public.access_keys_id_seq'::regclass);


--
-- Name: api_logs id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.api_logs ALTER COLUMN id SET DEFAULT nextval('public.api_logs_id_seq'::regclass);


--
-- Name: emails id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.emails ALTER COLUMN id SET DEFAULT nextval('public.emails_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: sent_mails id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.sent_mails ALTER COLUMN id SET DEFAULT nextval('public.sent_mails_id_seq'::regclass);


--
-- Name: token_usage id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.token_usage ALTER COLUMN id SET DEFAULT nextval('public.token_usage_id_seq'::regclass);


--
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- Data for Name: access_keys; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.access_keys (id, token_id, key_hash, key_prefix, name, is_active, last_used_at, created_at) FROM stdin;
1	10	12439f05e100352572c5940b287f066d00a695c9e00f0ef78507333aad653554	mtak_wITSh77	e2e-test	t	2026-05-15 18:28:10.123234	2026-05-15 18:24:17.779542
\.


--
-- Data for Name: api_logs; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.api_logs (id, token_id, endpoint, tokens_consumed, "timestamp") FROM stdin;
1	2	/api/v1/email/create	5	2026-05-15 16:47:47.223102
2	2	/api/v1/email/list	2	2026-05-15 16:47:47.264567
3	2	/api/v1/token/usage	1	2026-05-15 16:47:47.308976
4	3	/api/v1/email/create	5	2026-05-15 16:52:57.789933
5	3	/api/v1/email/list	2	2026-05-15 16:52:58.522613
6	4	/api/v1/email/create	5	2026-05-15 16:55:43.23475
7	4	/api/v1/email/create	5	2026-05-15 16:55:43.498658
8	4	/api/v1/email/list	2	2026-05-15 16:55:43.720035
9	4	/api/v1/token/usage	1	2026-05-15 16:55:43.957134
10	5	/api/v1/email/list	2	2026-05-15 16:56:30.623795
11	5	/api/v1/token/usage	1	2026-05-15 16:56:30.633583
12	5	/api/v1/email/list	2	2026-05-15 16:56:40.317364
13	5	/api/v1/email/create	5	2026-05-15 16:56:44.641097
14	5	/api/v1/email/list	2	2026-05-15 16:56:44.864627
15	5	/api/v1/email/5/messages	3	2026-05-15 16:56:46.218067
16	5	/api/v1/email/list	2	2026-05-15 16:56:46.221058
17	5	/api/v1/token/usage	1	2026-05-15 16:56:46.227152
18	5	/api/v1/email/5/messages	3	2026-05-15 16:56:56.231569
19	5	/api/v1/email/list	2	2026-05-15 16:56:56.233812
20	5	/api/v1/email/5/messages	3	2026-05-15 16:57:06.965325
21	5	/api/v1/email/list	2	2026-05-15 16:57:06.965614
22	5	/api/v1/email/list	2	2026-05-15 16:57:16.414476
23	5	/api/v1/email/5/messages	3	2026-05-15 16:57:16.418948
24	5	/api/v1/email/5/messages	3	2026-05-15 16:57:17.71119
25	5	/api/v1/token/usage	1	2026-05-15 16:57:17.760031
26	5	/api/v1/email/list	2	2026-05-15 16:57:17.768726
27	5	/api/v1/email/5/messages	3	2026-05-15 16:57:17.979281
28	5	/api/v1/email/list	2	2026-05-15 16:57:18.175844
29	5	/api/v1/email/5/messages	3	2026-05-15 16:57:18.179805
30	5	/api/v1/token/usage	1	2026-05-15 16:57:18.187264
31	5	/api/v1/email/5/messages	3	2026-05-15 16:57:18.39469
32	5	/api/v1/token/usage	1	2026-05-15 16:57:18.525171
33	5	/api/v1/email/list	2	2026-05-15 16:57:18.526202
34	5	/api/v1/email/5/messages	3	2026-05-15 16:57:18.652794
35	5	/api/v1/email/5/messages	3	2026-05-15 16:57:18.849803
36	5	/api/v1/email/list	2	2026-05-15 16:57:18.89195
37	5	/api/v1/token/usage	1	2026-05-15 16:57:18.916938
38	5	/api/v1/email/5/messages	3	2026-05-15 16:57:19.050099
39	5	/api/v1/email/list	2	2026-05-15 16:57:19.209036
40	5	/api/v1/token/usage	1	2026-05-15 16:57:19.210276
41	5	/api/v1/email/5/messages	3	2026-05-15 16:57:19.255732
42	5	/api/v1/email/5/messages	3	2026-05-15 16:57:19.473548
43	5	/api/v1/email/5/messages	3	2026-05-15 16:57:19.659607
44	5	/api/v1/email/list	2	2026-05-15 16:57:24.66042
45	5	/api/v1/email/5/messages	3	2026-05-15 16:57:24.662552
46	5	/api/v1/email/5/messages	3	2026-05-15 16:57:24.906081
47	5	/api/v1/token/usage	1	2026-05-15 16:57:24.981239
48	5	/api/v1/email/list	2	2026-05-15 16:57:25.190622
49	5	/api/v1/email/5/messages	3	2026-05-15 16:57:25.211342
50	5	/api/v1/token/usage	1	2026-05-15 16:57:25.279581
51	5	/api/v1/email/5/messages	3	2026-05-15 16:57:25.53124
52	5	/api/v1/email/list	2	2026-05-15 16:57:25.564284
53	5	/api/v1/token/usage	1	2026-05-15 16:57:25.568917
54	5	/api/v1/email/5/messages	3	2026-05-15 16:57:25.793196
55	5	/api/v1/email/5/messages	3	2026-05-15 16:57:26.024738
56	5	/api/v1/token/usage	1	2026-05-15 16:57:26.12736
57	5	/api/v1/email/list	2	2026-05-15 16:57:26.128544
58	5	/api/v1/email/5/messages	3	2026-05-15 16:57:26.235091
59	5	/api/v1/email/list	2	2026-05-15 16:57:26.428552
60	5	/api/v1/token/usage	1	2026-05-15 16:57:26.509481
61	5	/api/v1/email/5/messages	3	2026-05-15 16:57:26.514702
62	5	/api/v1/email/5/messages	3	2026-05-15 16:57:26.880524
63	5	/api/v1/token/usage	1	2026-05-15 16:57:26.998538
64	5	/api/v1/email/list	2	2026-05-15 16:57:27.000586
65	5	/api/v1/email/5/messages	3	2026-05-15 16:57:27.40285
66	5	/api/v1/email/5/messages	3	2026-05-15 16:57:27.835532
67	5	/api/v1/email/5/messages	3	2026-05-15 16:57:28.1805
68	5	/api/v1/email/5/messages	3	2026-05-15 16:57:28.380165
69	5	/api/v1/email/5/messages	3	2026-05-15 16:57:28.607883
70	5	/api/v1/token/usage	1	2026-05-15 16:57:28.709324
71	5	/api/v1/email/list	2	2026-05-15 16:57:28.709756
72	5	/api/v1/email/5/messages	3	2026-05-15 16:57:29.02639
73	5	/api/v1/email/5/messages	3	2026-05-15 16:57:29.266905
74	5	/api/v1/email/5/messages	3	2026-05-15 16:57:29.457333
75	5	/api/v1/email/5/messages	3	2026-05-15 16:57:29.720459
76	5	/api/v1/email/5/messages	3	2026-05-15 16:57:31.124395
77	5	/api/v1/email/5/messages	3	2026-05-15 16:57:31.851129
78	5	/api/v1/email/5/messages	3	2026-05-15 16:57:32.301637
79	5	/api/v1/email/5/messages	3	2026-05-15 16:57:32.722537
80	5	/api/v1/email/5/messages	3	2026-05-15 16:57:32.961874
81	5	/api/v1/email/5/messages	3	2026-05-15 16:57:33.159424
82	5	/api/v1/email/5/messages	3	2026-05-15 16:57:33.366396
83	5	/api/v1/email/5/messages	3	2026-05-15 16:57:33.579187
84	5	/api/v1/email/5/messages	3	2026-05-15 16:57:33.878232
85	5	/api/v1/email/5/messages	3	2026-05-15 16:57:34.204764
86	5	/api/v1/email/5/messages	3	2026-05-15 16:57:34.441484
87	5	/api/v1/email/5/messages	3	2026-05-15 16:57:34.941138
88	5	/api/v1/email/5/messages	3	2026-05-15 16:57:35.244185
89	5	/api/v1/email/5/messages	3	2026-05-15 16:57:35.719205
90	5	/api/v1/email/5/messages	3	2026-05-15 16:57:36.452341
91	5	/api/v1/email/5/messages	3	2026-05-15 16:57:36.695824
92	5	/api/v1/email/5/messages	3	2026-05-15 16:57:37.045625
93	5	/api/v1/email/5/messages	3	2026-05-15 16:57:37.811123
94	5	/api/v1/email/5/messages	3	2026-05-15 16:57:38.440041
95	5	/api/v1/email/list	2	2026-05-15 16:57:38.695834
96	5	/api/v1/email/5/messages	3	2026-05-15 16:57:38.702536
97	5	/api/v1/email/5/messages	3	2026-05-15 16:57:38.996082
98	5	/api/v1/email/5/messages	3	2026-05-15 16:57:39.276172
99	5	/api/v1/email/5/messages	3	2026-05-15 16:57:39.848303
100	5	/api/v1/email/5/messages	3	2026-05-15 16:57:40.039627
101	5	/api/v1/email/5/messages	3	2026-05-15 16:57:40.276933
102	5	/api/v1/email/5/messages	3	2026-05-15 16:57:40.555408
103	5	/api/v1/email/5/messages	3	2026-05-15 16:57:40.775473
104	5	/api/v1/email/5/messages	3	2026-05-15 16:57:41.710181
105	5	/api/v1/email/5/messages	3	2026-05-15 16:57:41.933774
106	5	/api/v1/email/5/messages	3	2026-05-15 16:57:48.962641
107	5	/api/v1/email/list	2	2026-05-15 16:57:48.963927
108	5	/api/v1/email/5/messages	3	2026-05-15 16:57:57.453674
109	5	/api/v1/email/5/messages	3	2026-05-15 16:57:57.765379
110	5	/api/v1/email/5/messages	3	2026-05-15 16:57:58.053982
111	5	/api/v1/email/5/messages	3	2026-05-15 16:57:58.290451
112	5	/api/v1/email/5/messages	3	2026-05-15 16:57:58.504512
116	5	/api/v1/email/5/messages	3	2026-05-15 16:57:59.15329
120	5	/api/v1/email/5/messages	3	2026-05-15 16:58:00.220315
124	5	/api/v1/email/5/messages	3	2026-05-15 16:58:01.212476
128	5	/api/v1/email/list	2	2026-05-15 16:58:01.567579
131	5	/api/v1/token/usage	1	2026-05-15 16:58:01.952257
136	5	/api/v1/token/usage	1	2026-05-15 16:58:02.289677
140	5	/api/v1/email/5/messages	3	2026-05-15 16:58:03.085267
144	5	/api/v1/email/list	2	2026-05-15 16:58:12.968046
148	5	/api/v1/email/list	2	2026-05-15 16:58:32.960606
152	5	/api/v1/email/list	2	2026-05-15 16:58:52.962747
157	5	/api/v1/email/list	2	2026-05-15 16:59:12.29635
160	5	/api/v1/email/list	2	2026-05-15 16:59:32.964989
164	5	/api/v1/email/list	2	2026-05-15 16:59:52.974406
168	5	/api/v1/email/list	2	2026-05-15 17:00:12.956042
173	5	/api/v1/email/5/messages	3	2026-05-15 17:00:33.070887
113	5	/api/v1/email/list	2	2026-05-15 16:57:58.698487
117	5	/api/v1/email/5/messages	3	2026-05-15 16:57:59.358996
121	5	/api/v1/email/5/messages	3	2026-05-15 16:58:00.480521
125	5	/api/v1/email/list	2	2026-05-15 16:58:01.295413
129	5	/api/v1/token/usage	1	2026-05-15 16:58:01.57454
133	5	/api/v1/email/5/messages	3	2026-05-15 16:58:01.973288
137	5	/api/v1/email/5/messages	3	2026-05-15 16:58:02.362263
141	5	/api/v1/email/5/messages	3	2026-05-15 16:58:03.423562
145	5	/api/v1/email/5/messages	3	2026-05-15 16:58:12.978688
149	5	/api/v1/email/5/messages	3	2026-05-15 16:58:32.987652
153	5	/api/v1/email/5/messages	3	2026-05-15 16:58:52.969381
156	5	/api/v1/email/5/messages	3	2026-05-15 16:59:12.294611
161	5	/api/v1/email/5/messages	3	2026-05-15 16:59:32.966652
165	5	/api/v1/email/5/messages	3	2026-05-15 16:59:52.975306
169	5	/api/v1/email/5/messages	3	2026-05-15 17:00:12.957367
172	5	/api/v1/email/list	2	2026-05-15 17:00:33.054833
114	5	/api/v1/email/5/messages	3	2026-05-15 16:57:58.71999
118	5	/api/v1/email/5/messages	3	2026-05-15 16:57:59.747486
122	5	/api/v1/email/5/messages	3	2026-05-15 16:58:00.737684
126	5	/api/v1/token/usage	1	2026-05-15 16:58:01.305082
130	5	/api/v1/email/5/messages	3	2026-05-15 16:58:01.649705
134	5	/api/v1/email/5/messages	3	2026-05-15 16:58:02.169942
138	5	/api/v1/email/5/messages	3	2026-05-15 16:58:02.549415
142	5	/api/v1/email/5/messages	3	2026-05-15 16:58:03.735102
146	5	/api/v1/email/list	2	2026-05-15 16:58:23.063212
150	5	/api/v1/email/list	2	2026-05-15 16:58:43.069461
154	5	/api/v1/email/list	2	2026-05-15 16:59:03.02346
158	5	/api/v1/email/list	2	2026-05-15 16:59:22.97549
163	5	/api/v1/email/list	2	2026-05-15 16:59:42.982462
166	5	/api/v1/email/list	2	2026-05-15 17:00:02.957759
170	5	/api/v1/email/list	2	2026-05-15 17:00:22.972203
174	5	/api/v1/email/list	2	2026-05-15 17:00:43.054448
115	5	/api/v1/email/5/messages	3	2026-05-15 16:57:58.917689
119	5	/api/v1/email/5/messages	3	2026-05-15 16:57:59.986554
123	5	/api/v1/email/5/messages	3	2026-05-15 16:58:00.992676
127	5	/api/v1/email/5/messages	3	2026-05-15 16:58:01.45704
132	5	/api/v1/email/list	2	2026-05-15 16:58:01.954422
135	5	/api/v1/email/list	2	2026-05-15 16:58:02.285578
139	5	/api/v1/email/5/messages	3	2026-05-15 16:58:02.773505
143	5	/api/v1/email/5/messages	3	2026-05-15 16:58:03.986746
147	5	/api/v1/email/5/messages	3	2026-05-15 16:58:23.066393
151	5	/api/v1/email/5/messages	3	2026-05-15 16:58:43.070479
155	5	/api/v1/email/5/messages	3	2026-05-15 16:59:03.024759
159	5	/api/v1/email/5/messages	3	2026-05-15 16:59:22.976231
162	5	/api/v1/email/5/messages	3	2026-05-15 16:59:42.979038
167	5	/api/v1/email/5/messages	3	2026-05-15 17:00:02.9658
171	5	/api/v1/email/5/messages	3	2026-05-15 17:00:22.981362
175	5	/api/v1/email/5/messages	3	2026-05-15 17:00:43.060811
176	5	/api/v1/email/list	2	2026-05-15 17:00:52.960167
177	5	/api/v1/email/5/messages	3	2026-05-15 17:00:52.985853
178	5	/api/v1/email/list	2	2026-05-15 17:01:03.118856
179	5	/api/v1/email/5/messages	3	2026-05-15 17:01:03.12745
180	5	/api/v1/email/list	2	2026-05-15 17:01:13.033464
181	5	/api/v1/email/5/messages	3	2026-05-15 17:01:13.067033
182	5	/api/v1/email/5/messages	3	2026-05-15 17:01:17.083234
183	5	/api/v1/email/5/messages	3	2026-05-15 17:01:17.347391
184	5	/api/v1/email/5/messages	3	2026-05-15 17:01:17.606608
185	5	/api/v1/email/5/messages	3	2026-05-15 17:01:17.986709
186	5	/api/v1/email/5/messages	3	2026-05-15 17:01:18.195514
187	5	/api/v1/email/5/messages	3	2026-05-15 17:01:18.50551
188	5	/api/v1/email/5/messages	3	2026-05-15 17:01:18.737124
189	5	/api/v1/email/5/messages	3	2026-05-15 17:01:18.991476
190	5	/api/v1/email/5/messages	3	2026-05-15 17:01:19.256706
191	5	/api/v1/email/5/messages	3	2026-05-15 17:01:19.728307
192	5	/api/v1/email/5/messages	3	2026-05-15 17:01:19.929452
193	5	/api/v1/email/5/messages	3	2026-05-15 17:01:20.139844
194	5	/api/v1/email/5/messages	3	2026-05-15 17:01:20.34594
195	5	/api/v1/email/list	2	2026-05-15 17:01:20.664077
196	5	/api/v1/token/usage	1	2026-05-15 17:01:20.665931
197	5	/api/v1/email/5/messages	3	2026-05-15 17:01:20.701886
198	5	/api/v1/email/5/messages	3	2026-05-15 17:01:20.927605
199	5	/api/v1/token/usage	1	2026-05-15 17:01:21.009925
200	5	/api/v1/email/list	2	2026-05-15 17:01:21.012535
201	5	/api/v1/email/5/messages	3	2026-05-15 17:01:21.150777
202	5	/api/v1/email/list	2	2026-05-15 17:01:21.371189
203	5	/api/v1/email/5/messages	3	2026-05-15 17:01:21.375281
204	5	/api/v1/token/usage	1	2026-05-15 17:01:21.381567
205	5	/api/v1/email/5/messages	3	2026-05-15 17:01:21.574298
206	5	/api/v1/email/list	2	2026-05-15 17:01:21.718522
207	5	/api/v1/token/usage	1	2026-05-15 17:01:21.72494
208	5	/api/v1/email/5/messages	3	2026-05-15 17:01:21.783162
209	5	/api/v1/email/list	2	2026-05-15 17:01:22.040036
210	5	/api/v1/token/usage	1	2026-05-15 17:01:22.045745
211	5	/api/v1/email/5/messages	3	2026-05-15 17:01:22.0468
212	5	/api/v1/email/5/messages	3	2026-05-15 17:01:22.293727
213	5	/api/v1/email/5/messages	3	2026-05-15 17:01:22.49593
214	5	/api/v1/email/5/messages	3	2026-05-15 17:01:22.698476
215	5	/api/v1/email/5/messages	3	2026-05-15 17:01:22.92546
216	5	/api/v1/email/5/messages	3	2026-05-15 17:01:23.132896
217	5	/api/v1/email/5/messages	3	2026-05-15 17:01:23.326834
218	5	/api/v1/email/list	2	2026-05-15 17:01:32.971941
219	5	/api/v1/email/5/messages	3	2026-05-15 17:01:33.00239
220	5	/api/v1/email/list	2	2026-05-15 17:01:42.967848
221	5	/api/v1/email/5/messages	3	2026-05-15 17:01:42.969517
222	5	/api/v1/email/list	2	2026-05-15 17:01:52.969554
223	5	/api/v1/email/5/messages	3	2026-05-15 17:01:52.982627
224	5	/api/v1/email/list	2	2026-05-15 17:02:02.96696
225	5	/api/v1/email/5/messages	3	2026-05-15 17:02:02.968366
226	5	/api/v1/email/list	2	2026-05-15 17:02:12.966396
227	5	/api/v1/email/5/messages	3	2026-05-15 17:02:12.967953
228	5	/api/v1/email/5/messages	3	2026-05-15 17:02:22.968558
229	5	/api/v1/email/list	2	2026-05-15 17:02:22.97074
230	5	/api/v1/email/list	2	2026-05-15 17:02:32.975218
231	5	/api/v1/email/5/messages	3	2026-05-15 17:02:32.976385
232	5	/api/v1/email/list	2	2026-05-15 17:02:42.976791
233	5	/api/v1/email/5/messages	3	2026-05-15 17:02:42.978891
234	5	/api/v1/email/5/messages	3	2026-05-15 17:02:52.994356
235	5	/api/v1/email/list	2	2026-05-15 17:02:52.995258
236	5	/api/v1/email/5/messages	3	2026-05-15 17:03:02.950766
237	5	/api/v1/email/list	2	2026-05-15 17:03:02.951945
238	5	/api/v1/email/list	2	2026-05-15 17:03:13.043053
239	5	/api/v1/email/5/messages	3	2026-05-15 17:03:13.046038
240	5	/api/v1/email/list	2	2026-05-15 17:03:22.956496
241	5	/api/v1/email/5/messages	3	2026-05-15 17:03:22.957716
242	5	/api/v1/email/5/messages	3	2026-05-15 17:03:42.983251
243	5	/api/v1/email/list	2	2026-05-15 17:03:42.984368
244	5	/api/v1/email/5/messages	3	2026-05-15 17:04:43.749452
245	5	/api/v1/email/list	2	2026-05-15 17:04:43.75077
246	5	/api/v1/email/5/messages	3	2026-05-15 17:05:44.596355
247	5	/api/v1/email/list	2	2026-05-15 17:05:44.598243
248	5	/api/v1/email/5/messages	3	2026-05-15 17:06:43.075586
249	5	/api/v1/email/list	2	2026-05-15 17:06:43.077317
250	5	/api/v1/email/5/messages	3	2026-05-15 17:07:42.998039
251	5	/api/v1/email/list	2	2026-05-15 17:07:42.999532
252	5	/api/v1/email/list	2	2026-05-15 17:08:42.998036
253	5	/api/v1/email/5/messages	3	2026-05-15 17:08:43.001507
254	5	/api/v1/email/list	2	2026-05-15 17:09:42.975651
255	5	/api/v1/email/5/messages	3	2026-05-15 17:09:42.981684
256	5	/api/v1/email/list	2	2026-05-15 17:10:43.009295
257	5	/api/v1/email/5/messages	3	2026-05-15 17:10:43.032386
258	5	/api/v1/email/list	2	2026-05-15 17:11:42.983181
259	5	/api/v1/email/5/messages	3	2026-05-15 17:11:42.988201
260	5	/api/v1/email/5/messages	3	2026-05-15 17:12:43.00265
261	5	/api/v1/email/list	2	2026-05-15 17:12:43.007998
262	5	/api/v1/email/5/messages	3	2026-05-15 17:13:42.995449
263	5	/api/v1/email/list	2	2026-05-15 17:13:43.024544
264	5	/api/v1/email/list	2	2026-05-15 17:14:42.988208
265	5	/api/v1/email/5/messages	3	2026-05-15 17:14:42.996699
266	5	/api/v1/email/5/messages	3	2026-05-15 17:15:43.010734
267	5	/api/v1/email/list	2	2026-05-15 17:15:43.017596
268	5	/api/v1/email/list	2	2026-05-15 17:16:42.986992
269	5	/api/v1/email/5/messages	3	2026-05-15 17:16:42.988368
270	5	/api/v1/email/5/messages	3	2026-05-15 17:17:43.035935
271	5	/api/v1/email/list	2	2026-05-15 17:17:43.035115
272	5	/api/v1/email/5/messages	3	2026-05-15 17:18:42.99561
273	5	/api/v1/email/list	2	2026-05-15 17:18:43.014257
274	5	/api/v1/email/list	2	2026-05-15 17:19:43.068563
275	5	/api/v1/email/5/messages	3	2026-05-15 17:19:43.095565
276	5	/api/v1/email/5/messages	3	2026-05-15 17:20:42.97306
277	5	/api/v1/email/list	2	2026-05-15 17:20:42.973803
278	5	/api/v1/email/5/messages	3	2026-05-15 17:21:02.471183
279	5	/api/v1/email/list	2	2026-05-15 17:21:02.472434
280	5	/api/v1/email/list	2	2026-05-15 17:21:04.204418
281	5	/api/v1/token/usage	1	2026-05-15 17:21:04.206132
282	7	/api/v1/email/create	5	2026-05-15 17:34:01.774044
283	8	/api/v1/email/create	5	2026-05-15 17:34:31.953231
284	8	/api/v1/email/7/messages	3	2026-05-15 17:34:36.246934
285	8	/api/v1/email/7/messages	3	2026-05-15 17:34:51.949113
286	7	/api/v1/email/6/messages	3	2026-05-15 17:34:52.506754
287	8	/api/v1/email/7/messages	3	2026-05-15 17:35:06.24688
288	8	/api/v1/email/7/messages	3	2026-05-15 17:35:20.996241
289	8	/api/v1/email/create	5	2026-05-15 17:35:29.419573
290	8	/api/v1/email/8/messages	3	2026-05-15 17:35:35.464056
291	8	/api/v1/email/7/messages	3	2026-05-15 17:35:36.077075
292	8	/api/v1/email/8/messages	3	2026-05-15 17:35:36.682895
293	8	/api/v1/email/7/messages	3	2026-05-15 17:35:38.862736
294	8	/api/v1/email/7/messages	3	2026-05-15 17:35:53.937887
295	8	/api/v1/email/7/messages	3	2026-05-15 17:36:08.869158
296	8	/api/v1/email/7/messages	3	2026-05-15 17:36:23.923888
297	8	/api/v1/email/7/messages	3	2026-05-15 17:36:38.961
298	8	/api/v1/email/7/messages	3	2026-05-15 17:36:53.930888
299	8	/api/v1/email/7/messages	3	2026-05-15 17:37:08.925297
300	7	/api/v1/email/6/messages	3	2026-05-15 17:37:26.039563
301	8	/api/v1/email/7/messages	3	2026-05-15 17:37:42.940644
302	8	/api/v1/email/7/messages	3	2026-05-15 17:38:31.944161
303	8	/api/v1/email/8/messages	3	2026-05-15 17:38:34.365252
304	8	/api/v1/email/7/messages	3	2026-05-15 17:38:35.43621
305	8	/api/v1/email/8/messages	3	2026-05-15 17:38:36.376144
306	8	/api/v1/email/7/messages	3	2026-05-15 17:38:38.137905
307	8	/api/v1/email/7/messages	3	2026-05-15 17:38:53.891679
308	8	/api/v1/email/7/messages	3	2026-05-15 17:39:08.140358
309	8	/api/v1/email/7/messages	3	2026-05-15 17:39:23.177488
310	8	/api/v1/email/7/messages	3	2026-05-15 17:39:38.144709
311	8	/api/v1/email/7/messages	3	2026-05-15 17:39:53.945085
312	8	/api/v1/email/7/messages	3	2026-05-15 17:40:08.943963
313	8	/api/v1/email/7/messages	3	2026-05-15 17:40:23.923118
314	8	/api/v1/email/7/messages	3	2026-05-15 17:40:38.941646
315	8	/api/v1/email/7/messages	3	2026-05-15 17:41:43.050559
316	8	/api/v1/email/7/messages	3	2026-05-15 17:42:43.002811
317	8	/api/v1/email/7/messages	3	2026-05-15 17:43:43.045919
318	7	/api/v1/email/create	5	2026-05-15 17:44:17.790357
319	7	/api/v1/email/create	5	2026-05-15 17:44:30.824421
320	8	/api/v1/email/7/messages	3	2026-05-15 17:44:42.951008
321	7	/api/v1/email/6/messages	3	2026-05-15 17:45:06.937312
322	7	/api/v1/email/9	2	2026-05-15 17:45:22.690505
323	8	/api/v1/email/7/messages	3	2026-05-15 17:45:42.986116
324	8	/api/v1/email/7/messages	3	2026-05-15 17:46:43.000085
325	8	/api/v1/email/8/messages	3	2026-05-15 18:12:39.669634
326	8	/api/v1/email/7/messages	3	2026-05-15 18:12:44.86468
327	8	/api/v1/email/7/messages	3	2026-05-15 18:12:59.874821
328	8	/api/v1/email/7/messages	3	2026-05-15 18:13:14.864365
329	8	/api/v1/email/create	5	2026-05-15 18:13:24.66746
330	8	/api/v1/email/10/messages	3	2026-05-15 18:13:28.466511
331	8	/api/v1/email/10/messages	3	2026-05-15 18:13:43.457146
332	8	/api/v1/email/10/messages	3	2026-05-15 18:13:59.000223
333	8	/api/v1/email/10/messages	3	2026-05-15 18:14:13.903801
334	8	/api/v1/email/8/messages	3	2026-05-15 18:14:26.075503
335	8	/api/v1/email/10/messages	3	2026-05-15 18:14:26.513597
336	8	/api/v1/email/8/messages	3	2026-05-15 18:14:35.466099
337	8	/api/v1/email/7/messages	3	2026-05-15 18:14:36.323943
338	8	/api/v1/email/10/messages	3	2026-05-15 18:14:37.203221
339	8	/api/v1/email/10/messages	3	2026-05-15 18:14:52.213217
340	8	/api/v1/email/10/messages	3	2026-05-15 18:15:07.210949
341	8	/api/v1/email/10/messages	3	2026-05-15 18:15:22.21488
342	8	/api/v1/email/10/messages	3	2026-05-15 18:15:37.214286
343	8	/api/v1/email/10/messages	3	2026-05-15 18:15:52.208004
344	8	/api/v1/email/10/messages	3	2026-05-15 18:16:07.207711
345	8	/api/v1/email/10/messages	3	2026-05-15 18:16:22.218837
346	8	/api/v1/email/10/messages	3	2026-05-15 18:16:37.212319
347	8	/api/v1/email/10/messages	3	2026-05-15 18:16:52.209517
348	8	/api/v1/email/10/messages	3	2026-05-15 18:17:07.268123
349	8	/api/v1/email/10/messages	3	2026-05-15 18:17:22.208353
350	8	/api/v1/email/10/messages	3	2026-05-15 18:17:37.211325
351	8	/api/v1/email/10/messages	3	2026-05-15 18:17:52.211751
352	8	/api/v1/email/10/messages	3	2026-05-15 18:18:07.221683
353	8	/api/v1/email/10/messages	3	2026-05-15 18:18:22.943791
354	8	/api/v1/email/10/messages	3	2026-05-15 18:18:37.975558
355	8	/api/v1/email/10/messages	3	2026-05-15 18:18:52.896111
356	8	/api/v1/email/10/messages	3	2026-05-15 18:19:07.907314
357	8	/api/v1/email/10/messages	3	2026-05-15 18:19:43.001344
358	8	/api/v1/email/10/messages	3	2026-05-15 18:20:43.000309
359	8	/api/v1/email/10/messages	3	2026-05-15 18:21:43.258512
360	8	/api/v1/email/10/messages	3	2026-05-15 18:22:06.530279
361	8	/api/v1/email/10/messages	3	2026-05-15 18:22:22.90194
362	8	/api/v1/email/10/messages	3	2026-05-15 18:22:37.904168
363	8	/api/v1/email/10/messages	3	2026-05-15 18:22:52.907276
364	8	/api/v1/email/10/messages	3	2026-05-15 18:23:07.892349
365	8	/api/v1/email/10/messages	3	2026-05-15 18:23:42.959422
366	8	/api/v1/email/10/messages	3	2026-05-15 18:23:58.261477
367	8	/api/v1/email/10/messages	3	2026-05-15 18:24:07.257703
368	10	/api/v1/email/create	5	2026-05-15 18:24:19.137829
369	10	/api/v1/mail/send	5	2026-05-15 18:24:28.800848
370	10	/api/v1/mail/send	5	2026-05-15 18:28:10.14057
371	8	/api/v1/mail/send	5	2026-05-15 18:34:50.671704
\.


--
-- Data for Name: emails; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.emails (id, token_id, address, subdomain, full_address, created_at, expires_at) FROM stdin;
1	2	9078d143f1183e18	temp	9078d143f1183e18@temp.amitbrand.shop	2026-05-15 16:47:47.229315	2026-05-16 16:47:47.229315
2	3	test	temp	test@temp.amitbrand.shop	2026-05-15 16:52:57.79507	2026-05-16 16:52:57.79507
3	4	demo	soul	demo@soul.amitbrand.shop	2026-05-15 16:55:43.245546	2026-05-16 16:55:43.245546
4	4	e03cd0f4e04ceb16	crack	e03cd0f4e04ceb16@crack.amitbrand.shop	2026-05-15 16:55:43.504624	2026-05-16 16:55:43.504624
5	5	a7d4eeda848a5e87	temp	a7d4eeda848a5e87@temp.amitbrand.shop	2026-05-15 16:56:44.647176	2026-05-16 16:56:44.647176
6	7	smtptest	temp	smtptest@temp.amitbrand.shop	2026-05-15 17:34:01.780156	2026-05-16 17:34:01.780156
7	8	e9b0089da6fe5e00	temp	e9b0089da6fe5e00@temp.amitbrand.shop	2026-05-15 17:34:31.958801	2026-05-16 17:34:31.958801
8	8	51e15557b731961a	temp	51e15557b731961a@temp.amitbrand.shop	2026-05-15 17:35:29.423234	2026-05-16 17:35:29.423234
10	8	soul	temp	soul@temp.amitbrand.shop	2026-05-15 18:13:24.679401	2026-05-16 18:13:24.679401
11	10	691f920dcb71a02e	temp	691f920dcb71a02e@temp.amitbrand.shop	2026-05-15 18:24:19.142533	2026-05-16 18:24:19.142533
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.messages (id, email_id, sender, subject, body_text, body_html, received_at, is_read) FROM stdin;
1	6	automated@test.local	SMTP Test - Automated	This is a test message to verify SMTP is working correctly!\n		2026-05-15 17:34:37.437664	f
2	8	test@external.com	Direct VPS Test from E1	This email was sent directly to VPS IP, bypassing Cloudflare DNS.\n\n\n		2026-05-15 17:57:08.884683	f
3	8	mxtest@external.com	MX Test - End to End	Sent via real MX hostname mail.temp.amitbrand.shop (not direct IP)\n\n\n		2026-05-15 18:11:38.31372	f
4	7	gmail.simulator@test.com	Final Test temp	Final delivery test for temp subdomain\n\n\n		2026-05-15 18:12:04.88337	f
5	10	"Vikrant Rana" <vikrantranahome@gmail.com>	ss	sdsds\n	<div dir="ltr">sdsds</div>\n	2026-05-15 18:13:48.93086	f
6	7	"Vikrant Rana" <vikrantranahome@gmail.com>	s	sf\n	<div dir="ltr">sf</div>\n	2026-05-15 18:17:02.623657	f
7	10	691f920dcb71a02e@temp.amitbrand.shop	E2E Loopback Test	This email was sent via the new /mail/send endpoint with DKIM signing.\n		2026-05-15 18:28:10.50936	f
\.


--
-- Data for Name: sent_mails; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.sent_mails (id, email_id, token_id, from_address, to_address, subject, body_text, status, error, sent_at) FROM stdin;
1	11	10	691f920dcb71a02e@temp.amitbrand.shop	test@example.org	DKIM test	hello from temp	failed	No MX record for example.org	2026-05-15 18:24:28.817674
2	11	10	691f920dcb71a02e@temp.amitbrand.shop	soul@temp.amitbrand.shop	E2E Loopback Test	This email was sent via the new /mail/send endpoint with DKIM signing.	sent	\N	2026-05-15 18:28:10.513963
3	10	8	unknown	vikrantranahome@gmail.com	hi	tera bhai ho	failed	Can't send mail - all recipients were rejected: 550 Invalid recipient domain	2026-05-15 18:34:50.917784
\.


--
-- Data for Name: token_usage; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.token_usage (id, token_id, usage_date, calls_count, last_reset) FROM stdin;
1	2	2026-05-15	8	2026-05-15 16:47:47.301625
4	3	2026-05-15	7	2026-05-15 16:52:58.519092
6	4	2026-05-15	13	2026-05-15 16:55:43.945945
10	5	2026-05-15	627	2026-05-15 17:21:04.204198
368	10	2026-05-15	15	2026-05-15 18:28:10.137299
283	8	2026-05-15	248	2026-05-15 18:34:50.66845
282	7	2026-05-15	26	2026-05-15 17:45:22.685153
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: mailtemp
--

COPY public.tokens (id, token, token_hash, created_at, daily_limit, is_active) FROM stdin;
1	9023cc873a30d710a3582d8e32f5dd96e4015cf6	f2ff872ee41450f4c9c713cba48cc10f156b58622905d76115df2f56382752f4	2026-05-15 16:47:33.858224	200000	t
2	aebe4daf038a2e505d21de98294a0c6105eb3e4a	bf73328ca8f425667bfc949226e396f27f519ad56b8a337d50d2a45eecc47740	2026-05-15 16:47:47.02057	200000	t
3	02210f83058ed93e7756a4974d0daa940f2aa970	f8436e66a3024d71cb25f3429e90d8764743ebd8f3c35ab39343023b8d80b7ef	2026-05-15 16:52:56.714006	200000	t
4	8c9d45f2ab1d48f99e9b7865f64bafc61ba801d0	faf1c6c9d58f64450234964d31556f66e417486e4d411c076d636a3b7b90d82e	2026-05-15 16:55:42.703126	200000	t
5	d4cc47666fd4ee9334621b4f9fecf7a5e17d25ce	921ff642d5c36a9f8936544cc71cf7d1762b97b4ae4cb83275836a5f218b2e2e	2026-05-15 16:56:24.190102	200000	t
6	3a31d9e99a5a4abcb16df382e99887ca2d869899	9e52dfad489d03ad7075c6333598926cc67d2968c27b076618e02e0cf515fbdc	2026-05-15 17:21:19.996947	200000	t
7	d93fb157c5235089b8778d8d02881f1f1936a3d7	41420437f9a8e8bac5c94a935daf3f00e90b9eeb4d9bb2fa094e43cc7ee32a48	2026-05-15 17:33:36.41154	200000	t
8	610a3aea29296e9d9b38aac4acd9f68d56edef1e	047fc807d5652db642c45507f1b82563c389ff8c7453c5d9a469f5d6d24b3df5	2026-05-15 17:33:53.011614	200000	t
9	b37dd900c395240adf2800c6a52a0a469d3c8095	98d393134f709269e3d36c8ed9343c82c03d0efb833a2724f5f8f959a0fb2a08	2026-05-15 17:42:15.694471	200000	t
10	67970b243565f92e48ac9d5ef881cfc856e7b218	2e1ae7fb5d5e28914b21e619ac6756cbb0f70671a29a88a169543b6ab7c831ab	2026-05-15 18:24:16.766291	200000	t
11	0ffe2723e722257733ad8155d5258568d362af6c	5085b5c772c31ae4211f8a690b43cc20a9a662efce5193a5dcba1b5b808ea648	2026-05-15 18:49:43.636957	200000	t
\.


--
-- Name: access_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.access_keys_id_seq', 2, true);


--
-- Name: api_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.api_logs_id_seq', 371, true);


--
-- Name: emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.emails_id_seq', 11, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.messages_id_seq', 7, true);


--
-- Name: sent_mails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.sent_mails_id_seq', 3, true);


--
-- Name: token_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.token_usage_id_seq', 371, true);


--
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailtemp
--

SELECT pg_catalog.setval('public.tokens_id_seq', 11, true);


--
-- Name: access_keys access_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.access_keys
    ADD CONSTRAINT access_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: access_keys access_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.access_keys
    ADD CONSTRAINT access_keys_pkey PRIMARY KEY (id);


--
-- Name: api_logs api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_pkey PRIMARY KEY (id);


--
-- Name: emails emails_full_address_key; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_full_address_key UNIQUE (full_address);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: sent_mails sent_mails_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_pkey PRIMARY KEY (id);


--
-- Name: token_usage token_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.token_usage
    ADD CONSTRAINT token_usage_pkey PRIMARY KEY (id);


--
-- Name: token_usage token_usage_token_id_usage_date_key; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.token_usage
    ADD CONSTRAINT token_usage_token_id_usage_date_key UNIQUE (token_id, usage_date);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: tokens tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_token_key UNIQUE (token);


--
-- Name: idx_access_keys_hash; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_access_keys_hash ON public.access_keys USING btree (key_hash);


--
-- Name: idx_access_keys_token; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_access_keys_token ON public.access_keys USING btree (token_id);


--
-- Name: idx_api_logs_timestamp; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_api_logs_timestamp ON public.api_logs USING btree ("timestamp");


--
-- Name: idx_emails_expires_at; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_emails_expires_at ON public.emails USING btree (expires_at);


--
-- Name: idx_emails_full_address; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_emails_full_address ON public.emails USING btree (full_address);


--
-- Name: idx_emails_token_id; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_emails_token_id ON public.emails USING btree (token_id);


--
-- Name: idx_messages_email_id; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_messages_email_id ON public.messages USING btree (email_id);


--
-- Name: idx_messages_received_at; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_messages_received_at ON public.messages USING btree (received_at);


--
-- Name: idx_sent_mails_token; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_sent_mails_token ON public.sent_mails USING btree (token_id);


--
-- Name: idx_token_usage_token_date; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_token_usage_token_date ON public.token_usage USING btree (token_id, usage_date);


--
-- Name: idx_tokens_is_active; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_tokens_is_active ON public.tokens USING btree (is_active);


--
-- Name: idx_tokens_token_hash; Type: INDEX; Schema: public; Owner: mailtemp
--

CREATE INDEX idx_tokens_token_hash ON public.tokens USING btree (token_hash);


--
-- Name: access_keys access_keys_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.access_keys
    ADD CONSTRAINT access_keys_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id) ON DELETE CASCADE;


--
-- Name: api_logs api_logs_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id) ON DELETE SET NULL;


--
-- Name: emails emails_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id) ON DELETE CASCADE;


--
-- Name: messages messages_email_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE CASCADE;


--
-- Name: sent_mails sent_mails_email_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE CASCADE;


--
-- Name: sent_mails sent_mails_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id) ON DELETE CASCADE;


--
-- Name: token_usage token_usage_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mailtemp
--

ALTER TABLE ONLY public.token_usage
    ADD CONSTRAINT token_usage_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict eoszeLxfKSJ6v31HK1iYxtQSSiandbK9CVjRGVr5vzfHwsBbC12O4us25PRWozN

