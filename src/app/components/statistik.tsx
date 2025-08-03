import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import CountUp from 'react-countup';
import Link from 'next/link';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
  href?: string; // Make href prop optional
}

const StatisticsCard = ({
  title,
  value,
  icon,
  color,
  href,
}: StatisticsCardProps) => {
  const cardContent = (
    <Card
      className={`w-full transition-all duration-300 ease-in-out transform hover:scale-105 ${href ? 'cursor-pointer' : ''}`}
    >
      {' '}
      {/* Add cursor-pointer class conditionally */}
      <CardBody className='flex flex-col items-center text-center p-6'>
        <div className={`p-4 rounded-lg bg-${color}-100 mb-4`}>
          <Icon icon={icon} className={`w-8 h-8 text-${color}-500`} />
        </div>
        <p className='text-sm text-default-500 mb-2'>{title}</p>
        <h4 className='text-3xl font-bold'>
          <CountUp end={value} duration={2} />
        </h4>
      </CardBody>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
};
export default StatisticsCard;
