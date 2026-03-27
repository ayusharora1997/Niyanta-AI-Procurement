import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { VendorDiscovery } from './screens/VendorDiscovery';
import { VendorDump } from './screens/VendorDump';
import { VendorReview } from './screens/VendorReview';
import { VendorPipeline } from './screens/VendorPipeline';
import { OutreachLog } from './screens/OutreachLog';
import { ManualOutreachQueue } from './screens/ManualOutreachQueue';
import { VendorDetail } from './screens/VendorDetail';
import { VendorMaster } from './screens/VendorMaster';

export const router = createBrowserRouter([
  { path: '/', element: <Layout><Dashboard /></Layout> },
  { path: '/discovery', element: <Layout><VendorDiscovery /></Layout> },
  { path: '/discovery/dump', element: <Layout><VendorDump /></Layout> },
  { path: '/dump', element: <Layout><VendorDump /></Layout> },
  { path: '/vendor-master', element: <Layout><VendorMaster /></Layout> },
  { path: '/review', element: <Layout><VendorReview /></Layout> },
  { path: '/pipeline', element: <Layout><VendorPipeline /></Layout> },
  { path: '/outreach-log', element: <Layout><OutreachLog /></Layout> },
  { path: '/manual-queue', element: <Layout><ManualOutreachQueue /></Layout> },
  { path: '/vendor/:vendorId', element: <Layout><VendorDetail /></Layout> },
]);
