import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, name);

    if (error) {
      toast({ title: 'त्रुटि', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'सफल', description: isLogin ? 'लग इन सफल भयो' : 'साइन अप सफल भयो' });
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="news-container py-12">
        <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">{isLogin ? 'लग इन' : 'साइन अप'}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">नाम</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <Label htmlFor="email">इमेल</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">पासवर्ड</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'पर्खनुहोस्...' : isLogin ? 'लग इन' : 'साइन अप'}
            </Button>
          </form>
          <p className="text-center mt-4 text-sm text-muted-foreground">
            {isLogin ? 'खाता छैन?' : 'पहिले नै खाता छ?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? 'साइन अप' : 'लग इन'}
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
