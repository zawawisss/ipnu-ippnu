import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import CountUp from 'react-countup';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning';
}

const StatisticsCard = ({ title, value, icon, color }: StatisticsCardProps) => {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col items-center text-center p-6">
        <div className={`p-4 rounded-lg bg-${color}-100 mb-4`}>
          <Icon icon={icon} className={`w-8 h-8 text-${color}-500`} />
        </div>
        <p className="text-sm text-default-500 mb-2">{title}</p>
        <h4 className="text-3xl font-bold">
          <CountUp end={value} duration={2} />
        </h4>
      </CardBody>
    </Card>
  );
}
export default StatisticsCard;