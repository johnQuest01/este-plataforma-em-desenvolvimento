'use client';

import LoginPage from '@/app/login/page';
import { withGuardian } from '@/components/guardian/GuardianBeacon';

/** Mesma experiência de /login: e-mail e senha primeiro; cadastro só ao expandir. */
const EntryPageBase = LoginPage;

export default withGuardian(EntryPageBase, 'app/page.tsx', 'PAGE');
