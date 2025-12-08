import AuthWrapper from '../components/AuthWrapper';
import HomeContent from '../components/HomeContent';

export default function HomePage() {
  return (
    <AuthWrapper>
      <HomeContent />
    </AuthWrapper>
  );
}
