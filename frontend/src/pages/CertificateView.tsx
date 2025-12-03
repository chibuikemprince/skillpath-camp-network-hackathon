import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Award, CheckCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchOnchainCertificate, OnchainCertificate } from '../utils/certificateContract';
import { buildCertificateJson } from '../utils/certificateBuilder';

type CertificateJson = ReturnType<typeof buildCertificateJson>;

const decodeMetadata = async (uri: string): Promise<CertificateJson | null> => {
  try {
    if (uri.startsWith('data:application/json')) {
      const [, payload] = uri.split(',');
      const json = decodeURIComponent(payload);
      return JSON.parse(json);
    }
    const res = await fetch(uri);
    const text = await res.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to decode metadata', err);
    return null;
  }
};

const prettify = (value: string | number | undefined) => value ?? '—';

const CertificateView: React.FC = () => {
  const { curriculumId } = useParams();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onchain, setOnchain] = useState<OnchainCertificate | null>(null);
  const [metadata, setMetadata] = useState<CertificateJson | null>(null);

  const userIdParam = params.get('userId') || undefined;
  const walletParam = params.get('wallet') || undefined;
  const uriParam = params.get('uri') || params.get('metadata') || undefined;

  const title = useMemo(() => metadata?.course?.title || 'Certificate', [metadata]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) If metadata URI provided, decode it
        if (uriParam) {
          const meta = await decodeMetadata(uriParam);
          if (meta) setMetadata(meta);
        }

        // 2) If we have userId + wallet, fetch from chain to get metadataUri
        if (userIdParam && walletParam) {
          const cert = await fetchOnchainCertificate(userIdParam, walletParam);
          if (cert?.exists) {
            setOnchain(cert);
            if (!metadata) {
              const meta = await decodeMetadata(cert.metadataUri);
              if (meta) setMetadata(meta);
            }
          } else {
            setError('No on-chain certificate found for this user/wallet.');
          }
        } else if (!uriParam) {
          setError('Provide userId & wallet, or a metadata URI.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, userIdParam, walletParam, uriParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-pulse text-sm text-slate-300">Loading certificate...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 text-slate-100 px-6 py-4 rounded-lg space-y-3 w-96 text-center">
          <p className="text-sm">{error}</p>
          <Link to="/dashboard" className="inline-flex items-center text-xs text-indigo-300 hover:text-indigo-200">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-lg">
          <p className="text-sm text-slate-200">No certificate metadata available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-sm text-indigo-300 hover:text-indigo-200 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <span className="text-xs text-slate-400">Curriculum ID: {curriculumId}</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30">
          <div className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="h-10 w-10 text-amber-200" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-indigo-100">Proof of Learning</p>
                  <h1 className="text-3xl font-bold text-white">{title}</h1>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-100">Issued To</p>
                <p className="text-lg font-semibold text-white">{metadata.learner.displayName}</p>
                <p className="text-xs text-indigo-100">{metadata.learner.walletAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/15 rounded-xl p-4 border border-white/10">
              <div>
                <p className="text-xs text-indigo-100 uppercase tracking-wide">Skill</p>
                <p className="text-lg font-semibold text-white">{metadata.course.title}</p>
                <p className="text-sm text-indigo-100">Level: {metadata.course.level}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-indigo-100 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide">Completion</p>
                  <p className="text-xl font-bold text-white">{metadata.performance.completionPercent}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide">Mastery Score</p>
                  <p className="text-xl font-bold text-white">{metadata.performance.masteryScore}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide">Hours Studied</p>
                  <p className="text-xl font-bold text-white">{metadata.performance.hoursStudied}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide">Quizzes Passed</p>
                  <p className="text-xl font-bold text-white">{metadata.performance.quizzesPassed}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-indigo-100">
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Issued By</p>
                  <p className="text-white">SkillPath</p>
                  <p className="text-indigo-200 text-xs">Version {metadata.issued.version}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3">
                <Clock className="h-4 w-4 text-amber-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Issued At</p>
                  <p className="text-white">{new Date(metadata.issued.issuedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {onchain && (
              <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-sm text-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide">On-chain record</span>
                  <span className="text-[11px] text-indigo-200">Contract: {onchain.issuer}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>Curriculum: {onchain.curriculumId || curriculumId}</p>
                  <p>Wallet: {onchain.walletId}</p>
                  <p>User: {onchain.userId}</p>
                  <p>Issued: {new Date(Number(onchain.issuedAt) * 1000).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
